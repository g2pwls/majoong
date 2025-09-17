package com.e105.majoong.blockchain.service;

import com.e105.majoong.blockchain.props.ChainProps;
import com.e105.majoong.common.domain.FarmVault;
import com.e105.majoong.blockchain.repository.FarmVaultRepository;
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
import org.web3j.protocol.core.methods.response.*;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VaultService {

  private final Web3j web3j;
  private final Credentials admin;            // admin private key 주입
  private final ChainProps chainProps;        // factoryAddress, chainId 등
  private final FarmVaultRepository farmVaultRepository;

  private static final String ADDR_REGEX = "^0x[0-9a-fA-F]{40}$";
  private static final BigInteger GAS_LIMIT_MIN = BigInteger.valueOf(120_000L);

  /** 이미 있으면 반환, 없으면 체인에 생성 후 upsert */
  @Transactional
  public FarmVault getOrCreateVault(BigInteger farmId, String owner, String memberUuid) {
    final String farmIdHex = toHex256(farmId);
    return farmVaultRepository.findByFarmId(farmIdHex)
        .orElseGet(() -> createVaultAndPersist(farmId, owner, memberUuid));
  }

  /** 체인에 Vault 생성 → vaultOf로 주소 조회 → DB upsert (가장 단순/안정 흐름) */
  @Transactional
  public FarmVault createVaultAndPersist(BigInteger farmId, String owner, String memberUuid) {
    final String farmIdHex = toHex256(farmId);

    Optional<FarmVault> exists = farmVaultRepository.findByFarmId(farmIdHex);
    if (exists.isPresent()) return exists.get();

    try {
      // 입력 가드
      final String factory = chainProps.getFactoryAddress();
      if (!isValidAddress(factory)) throw new IllegalArgumentException("Invalid FACTORY_ADDRESS: " + factory);
      if (!isValidAddress(owner))   throw new IllegalArgumentException("Invalid ownerAddress: " + owner);
      if (farmId == null || farmId.signum() < 0) throw new IllegalArgumentException("Invalid farmId: " + farmId);

      // 팩토리 코드 존재 확인 (주소 오타/네트워크 불일치 조기 발견)
      String code = web3j.ethGetCode(factory, DefaultBlockParameterName.LATEST).send().getCode();
      if (code == null || "0x".equalsIgnoreCase(code))
        throw new IllegalStateException("Factory address has no code: " + factory);

      // createVault(farmId, owner) 인코딩
      Function fn = new Function(
          "createVault",
          List.of(new Uint256(farmId), new Address(owner)),
          Collections.emptyList()
      );
      String data = FunctionEncoder.encode(fn);

      // 논스/가스 (하드햇 E2E와 동일한 단순 전략)
      BigInteger nonce     = web3j.ethGetTransactionCount(admin.getAddress(), DefaultBlockParameterName.PENDING)
          .send().getTransactionCount();
      BigInteger gasPrice  = web3j.ethGasPrice().send().getGasPrice();               // 레거시 gasPrice
      BigInteger estimated = estimateGas(factory, data);                              // 실패 시 300k fallback
      BigInteger gasLimit  = estimated.add(estimated.divide(BigInteger.valueOf(5)))   // +20% 버퍼
          .max(GAS_LIMIT_MIN);

      // 레거시 트랜잭션 생성/서명/전송
      RawTransaction raw = RawTransaction.createTransaction(
          nonce, gasPrice, gasLimit, factory, BigInteger.ZERO, data
      );
      byte[] signed = TransactionEncoder.signMessage(raw, chainProps.getChainId().longValue(), admin);
      EthSendTransaction sent = web3j.ethSendRawTransaction(Numeric.toHexString(signed)).send();
      if (sent.hasError()) throw new RuntimeException("TX error: " + sent.getError().getMessage());
      String txHash = sent.getTransactionHash();
      log.info("[Vault] sent tx={}", txHash);

      // 영수증 대기(간단 폴링)
      TransactionReceipt receipt = waitForReceipt(txHash);
      log.info("[Vault] mined block={}, status={}", receipt.getBlockNumber(), receipt.isStatusOK());

      // vaultOf(farmId)로 주소 확인 (테스트와 동일)
      String vaultAddress = callVaultOf(farmId);
      if (!isValidAddress(vaultAddress))
        throw new IllegalStateException("Factory returned invalid vault address: " + vaultAddress);

      // DB upsert
      FarmVault fv = farmVaultRepository.findByMemberUuid(memberUuid)
          .orElse(FarmVault.builder().memberUuid(memberUuid).build());
      fv.updateFarmId(farmIdHex);
      fv.updateVaultAddress(vaultAddress);
      fv.updateDeployTxHash(txHash);
      fv.updateStatus(FarmVault.Status.ACTIVE);

      return farmVaultRepository.save(fv);

    } catch (Exception e) {
      throw new RuntimeException("Vault 생성/저장 실패", e);
    }
  }

  @Transactional(readOnly = true)
  public Optional<FarmVault> findByFarmId(BigInteger farmId) {
    return farmVaultRepository.findByFarmId(toHex256(farmId));
  }

  // ────────────── view & util ──────────────

  /** factory.vaultOf(farmId) */
  private String callVaultOf(BigInteger farmId) throws Exception {
    Function view = new Function(
        "vaultOf",
        List.of(new Uint256(farmId)),
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
