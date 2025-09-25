package com.e105.majoong.blockchain.service;

import com.e105.majoong.blockchain.props.ChainProps;
import com.e105.majoong.common.model.farmVault.FarmVault;
import com.e105.majoong.common.model.farmVault.FarmVaultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.EthEstimateGas;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VaultService {

  private final Web3j web3j;
  private final Credentials admin;            // 관리자 프라이빗키(서명용)
  private final ChainProps chainProps;        // 체인 설정값(체인ID, 팩토리 주소 등)
  private final FarmVaultRepository farmVaultRepository;

  private static final String ADDR_REGEX = "^0x[0-9a-fA-F]{40}$";
  private static final BigInteger GAS_LIMIT_MIN = BigInteger.valueOf(120_000L);

  // ===================================================================================
  // Vault 생성/조회
  // ===================================================================================


  /** 체인에 Vault 생성 → vaultOf로 주소 조회 → DB upsert */
  @Transactional
  public FarmVault createVaultAndPersist(BigInteger keccakKey, String owner, String memberUuid) {
    final String keccakKeyHex = toHex256(keccakKey);

    Optional<FarmVault> exists = farmVaultRepository.findByKeccakKey(keccakKeyHex);
    if (exists.isPresent()) return exists.get();

    try {
      // 입력 가드
      final String factory = chainProps.getFactoryAddress();
      if (!isValidAddress(factory)) throw new IllegalArgumentException("Invalid FACTORY_ADDRESS: " + factory);
      if (!isValidAddress(owner))   throw new IllegalArgumentException("Invalid ownerAddress: " + owner);
      // 팩토리 코드 존재 확인 (주소 오타/네트워크 불일치 조기 발견)
      String code = web3j.ethGetCode(factory, DefaultBlockParameterName.LATEST).send().getCode();
      if (code == null || "0x".equalsIgnoreCase(code))
        throw new IllegalStateException("Factory address has no code: " + factory);

      // createVault(keccakKey, owner) 인코딩
      Function fn = new Function(
          "createVault",
          List.of(new Uint256(keccakKey), new Address(owner)),
          Collections.emptyList()
      );
      String data = FunctionEncoder.encode(fn);

      // 논스/가스 (레거시 gasPrice 전략)
      BigInteger nonce     = web3j.ethGetTransactionCount(admin.getAddress(), DefaultBlockParameterName.PENDING)
          .send().getTransactionCount();
      BigInteger gasPrice  = web3j.ethGasPrice().send().getGasPrice();
      BigInteger estimated = estimateGas(factory, data);
      BigInteger gasLimit  = estimated.add(estimated.divide(BigInteger.valueOf(5))) // +20% 버퍼
          .max(GAS_LIMIT_MIN);

      // 트랜잭션 생성/서명/전송
      RawTransaction raw = RawTransaction.createTransaction(
          nonce, gasPrice, gasLimit, factory, BigInteger.ZERO, data
      );
      byte[] signed = TransactionEncoder.signMessage(raw, chainProps.getChainId().longValue(), admin);
      EthSendTransaction sent = web3j.ethSendRawTransaction(Numeric.toHexString(signed)).send();
      if (sent.hasError()) throw new RuntimeException("TX error: " + sent.getError().getMessage());
      String txHash = sent.getTransactionHash();
      log.info("[VaultFactory.createVault] sent tx={}", txHash);

      // 영수증 대기
      TransactionReceipt receipt = waitForReceipt(txHash);
      log.info("[VaultFactory.createVault] mined block={}, status={}", receipt.getBlockNumber(), receipt.isStatusOK());

      // vaultOf(keccakKey) 조회로 실제 vault 주소 확인
      String vaultAddress = callVaultOf(keccakKey);
      if (!isValidAddress(vaultAddress))
        throw new IllegalStateException("Factory returned invalid vault address: " + vaultAddress);

      // DB upsert
      FarmVault fv = farmVaultRepository.findByMemberUuid(memberUuid)
          .orElse(FarmVault.builder().memberUuid(memberUuid).build());
      fv.updateKeccakKey(keccakKeyHex);
      fv.updateVaultAddress(vaultAddress);
      fv.updateDeployTxHash(txHash);
      fv.updateStatus(FarmVault.Status.ACTIVE);

      return farmVaultRepository.save(fv);

    } catch (Exception e) {
      throw new RuntimeException("Vault 생성/저장 실패", e);
    }
  }

  // ===================================================================================
  // RELEASE (정산 출금)
  // ===================================================================================

  /**
   * 실제 컨트랙트 시그니처에 맞는 구현: release(uint256 amount)
   * - AccessControl(RELEASER_ROLE)을 가진 admin 계정으로 호출
   * - 금고의 farmer(immutable)에게 토큰이 전송됨
   */
  @Transactional
  public String release(String vaultAddress, BigInteger amountWei) {
    try {
      // 0) 입력 가드
      if (!isValidAddress(vaultAddress)) throw new IllegalArgumentException("Invalid vaultAddress: " + vaultAddress);
      if (amountWei == null || amountWei.signum() <= 0)
        throw new IllegalArgumentException("Invalid amountWei: " + amountWei);

      // 1) 컨트랙트 코드 존재 확인
      String code = web3j.ethGetCode(vaultAddress, DefaultBlockParameterName.LATEST).send().getCode();
      if (code == null || "0x".equalsIgnoreCase(code))
        throw new IllegalStateException("Vault address has no code: " + vaultAddress);

      // 2) 함수 인코딩: release(uint256)
      Function fn = new Function(
          "release",
          List.of(new Uint256(amountWei)),
          Collections.emptyList()
      );
      String data = FunctionEncoder.encode(fn);

      // 3) nonce / gas (레거시 gasPrice)
      BigInteger nonce     = web3j.ethGetTransactionCount(admin.getAddress(), DefaultBlockParameterName.PENDING)
          .send().getTransactionCount();
      BigInteger gasPrice  = web3j.ethGasPrice().send().getGasPrice();
      BigInteger estimated = estimateGas(vaultAddress, data);
      BigInteger gasLimit  = estimated.add(estimated.divide(BigInteger.valueOf(5))) // +20% 버퍼
          .max(GAS_LIMIT_MIN);

      // 4) 트랜잭션 생성/서명/전송
      RawTransaction raw = RawTransaction.createTransaction(
          nonce, gasPrice, gasLimit, vaultAddress, BigInteger.ZERO, data
      );
      byte[] signed = TransactionEncoder.signMessage(raw, chainProps.getChainId().longValue(), admin);
      EthSendTransaction sent = web3j.ethSendRawTransaction(Numeric.toHexString(signed)).send();
      if (sent.hasError()) throw new RuntimeException("release TX error: " + sent.getError().getMessage());

      String txHash = sent.getTransactionHash();
      log.info("[Vault.release] sent tx={}", txHash);

      // 5) 영수증 대기 및 상태 확인
      TransactionReceipt receipt = waitForReceipt(txHash);
      if (!receipt.isStatusOK()) {
        throw new RuntimeException("release reverted, status=" + receipt.getStatus());
      }
      log.info("[Vault.release] mined block={}, gasUsed={}", receipt.getBlockNumber(), receipt.getGasUsed());

      return txHash;

    } catch (Exception e) {
      throw new RuntimeException("Vault release failed", e);
    }
  }
  /**
   * Vault 컨트랙트에 박힌 farmer 주소 조회
   */
  public String getOnchainFarmer(String vaultAddress) throws Exception {
    if (!isValidAddress(vaultAddress)) {
      throw new IllegalArgumentException("Invalid vault address: " + vaultAddress);
    }

    // Solidity: function farmer() public view returns (address)
    Function viewFn = new Function(
        "farmer",
        Collections.emptyList(),
        List.of(new TypeReference<Address>() {})
    );

    EthCall call = web3j.ethCall(
        Transaction.createEthCallTransaction(
            admin.getAddress(), vaultAddress, FunctionEncoder.encode(viewFn)
        ),
        DefaultBlockParameterName.LATEST
    ).send();

    if (call.hasError()) {
      throw new RuntimeException("farmer() call error: " + call.getError().getMessage());
    }

    List<Type> out = FunctionReturnDecoder.decode(call.getValue(), viewFn.getOutputParameters());
    if (out == null || out.isEmpty()) {
      throw new IllegalStateException("farmer() decode failed (empty output)");
    }

    return ((Address) out.get(0)).getValue();
  }
  
  /**
   * Vault 컨트랙트에 있는 토큰 잔액 조회
   */
  public BigInteger getVaultTokenBalanceWei(String vaultAddress) throws Exception {
    Function f = new Function(
        "tokenBalance",
        java.util.List.of(),
        java.util.List.of(new TypeReference<Uint256>() {})
    );
    String data = FunctionEncoder.encode(f);

    EthCall resp = web3j.ethCall(
        Transaction.createEthCallTransaction(null, vaultAddress, data),
        DefaultBlockParameterName.LATEST
    ).send();

    if (resp.isReverted()) {
      throw new IllegalStateException("tokenBalance() reverted: " + resp.getRevertReason());
    }
    java.util.List<Type> out = FunctionReturnDecoder.decode(resp.getValue(), f.getOutputParameters());
    if (out.isEmpty()) throw new IllegalStateException("Empty tokenBalance() output");
    return (BigInteger) out.get(0).getValue();
  }
  // ===================================================================================
  // VIEW & UTIL
  // ===================================================================================

  /** factory.vaultOf(keccakKey) */
  private String callVaultOf(BigInteger keccakKey) throws Exception {
    Function view = new Function(
        "vaultOf",
        List.of(new Uint256(keccakKey)),
        List.of(new TypeReference<Address>() {})
    );
    EthCall call = web3j.ethCall(
        Transaction.createEthCallTransaction(
            admin.getAddress(), chainProps.getFactoryAddress(), FunctionEncoder.encode(view)
        ),
        DefaultBlockParameterName.LATEST
    ).send();

    if (call.hasError()) throw new RuntimeException("vaultOf call error: " + call.getError().getMessage());

    List<Type> out = FunctionReturnDecoder.decode(call.getValue(), view.getOutputParameters());
    if (out == null || out.isEmpty()) throw new IllegalStateException("vaultOf decode failed (empty output)");
    return ((Address) out.get(0)).getValue();
  }

  /** 간단한 receipt 폴링: 1초 간격, 최대 180회(≈3분) */
  private TransactionReceipt waitForReceipt(String txHash) throws Exception {
    final int attempts = 180;
    for (int i = 0; i < attempts; i++) {
      Optional<TransactionReceipt> r = web3j.ethGetTransactionReceipt(txHash).send().getTransactionReceipt();
      if (r.isPresent()) return r.get();
      Thread.sleep(1000);
    }
    throw new RuntimeException("영수증 대기 타임아웃: " + txHash);
  }

  /** 실패 시 300k로 안전 fallback */
  private BigInteger estimateGas(String to, String data) {
    try {
      EthEstimateGas resp = web3j.ethEstimateGas(
          Transaction.createFunctionCallTransaction(admin.getAddress(), null, null, null, to, data)
      ).send();
      if (!resp.hasError() && resp.getAmountUsed() != null && resp.getAmountUsed().signum() > 0) {
        return resp.getAmountUsed();
      }
      log.warn("eth_estimateGas fallback: {}", (resp.getError() != null ? resp.getError().getMessage() : "null"));
    } catch (Exception e) {
      log.warn("eth_estimateGas exception -> fallback 300k: {}", e.toString());
    }
    return BigInteger.valueOf(300_000L);
  }

  private String toHex256(BigInteger n) {
    if (n == null) throw new IllegalArgumentException("farmId is null");
    String hex = n.toString(16);
    if (hex.length() > 64) throw new IllegalArgumentException("farmId exceeds 256-bit: " + n);
    return "0x" + String.format("%064x", n);
  }

  private boolean isValidAddress(String addr) {
    return addr != null && addr.matches(ADDR_REGEX);
  }
}
