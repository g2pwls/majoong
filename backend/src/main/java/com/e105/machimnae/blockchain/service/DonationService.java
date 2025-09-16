package com.e105.machimnae.blockchain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final Web3j web3j;
    private final TransactionManager tx;        // Admin 트랜잭션 서명자
    private final DefaultGasProvider gas;
    private final Credentials admin;            // 조회용(eth_call from) 등

    @Value("${chain.tokenAddress}")
    private String tokenAddress;

    @Value("${chain.factoryAddress}")
    private String factoryAddress;

    @Value("${chain.krwPerToken}")
    private long krwPerToken;

    /* ===========================
     * Public APIs (서비스 핵심)
     * =========================== */

    /** 목장주 등록 시: 팩토리로 Vault 생성 → 생성된 vault 주소 반환 */
    public String createVault(Long farmId, String farmerAddress) throws Exception {
        Function f = new Function(
                "createVault",
                Arrays.asList(new Uint256(farmId), new Address(farmerAddress)),
                Collections.emptyList()
        );
        sendTx(factoryAddress, f);
        // 생성 직후 매핑 조회
        return getVaultAddress(farmId);
    }

    /** 기부: (원화/비율) → amount 변환 → vault로 직접 mint + donor는 이벤트 기록 */
    public String donate(String donorAddress, Long farmId, long krwAmount) throws Exception {
        String vault = getVaultAddressOrThrow(farmId);
        BigInteger amount = toTokenAmount(krwAmount);

        Function f = new Function(
                "mintToVaultForDonor",
                Arrays.asList(new Address(donorAddress), new Address(vault), new Uint256(amount)),
                Collections.emptyList()
        );
        return sendTx(tokenAddress, f);
    }

    /** 영수증 진위 TRUE: vault에서 farmer에게 release */
    public String releaseToFarmer(Long farmId, long krwAmount) throws Exception {
        String vault = getVaultAddressOrThrow(farmId);
        BigInteger amount = toTokenAmount(krwAmount);

        Function f = new Function(
                "release",
                Arrays.asList(new Uint256(amount)),
                Collections.emptyList()
        );
        return sendTx(vault, f);
    }

    /** 정산 후 소각: admin이 farmer 지갑에서 burnFromFarmer */
    public String burnFromFarmer(String farmerAddress, long krwAmount) throws Exception {
        BigInteger amount = toTokenAmount(krwAmount);

        Function f = new Function(
                "burnFromFarmer",
                Arrays.asList(new Address(farmerAddress), new Uint256(amount)),
                Collections.emptyList()
        );
        return sendTx(tokenAddress, f);
    }

    /** 특정 farmId의 vault 잔액 조회(디버그/표시용) */
    public BigInteger getVaultBalance(Long farmId) throws Exception {
        String vault = getVaultAddressOrThrow(farmId);
        Function f = new Function(
                "balanceOf",
                Arrays.asList(new Address(vault)),
                Arrays.asList(new TypeReference<Uint256>() {})
        );
        String encoded = FunctionEncoder.encode(f);
        var resp = web3j.ethCall(
                org.web3j.protocol.core.methods.request.Transaction
                        .createEthCallTransaction(admin.getAddress(), tokenAddress, encoded),
                DefaultBlockParameterName.LATEST
        ).send();
        List<Type> out = FunctionReturnDecoder.decode(resp.getValue(), f.getOutputParameters());
        return (BigInteger) out.get(0).getValue();
    }

    /* ===========================
     * Internal Helpers
     * =========================== */

    /** factory.vaultOf(farmId) 조회 */
    public String getVaultAddress(Long farmId) throws Exception {
        Function f = new Function(
                "vaultOf",
                Arrays.asList(new Uint256(farmId)),
                Arrays.asList(new TypeReference<Address>() {})
        );
        String encoded = FunctionEncoder.encode(f);
        var resp = web3j.ethCall(
                org.web3j.protocol.core.methods.request.Transaction
                        .createEthCallTransaction(admin.getAddress(), factoryAddress, encoded),
                DefaultBlockParameterName.LATEST
        ).send();

        List<Type> out = FunctionReturnDecoder.decode(resp.getValue(), f.getOutputParameters());
        return ((Address) out.get(0)).getValue();
    }

    private String getVaultAddressOrThrow(Long farmId) throws Exception {
        String vault = getVaultAddress(farmId);
        if (isZeroAddress(vault)) {
            throw new IllegalStateException("Vault not found. Create vault first for farmId=" + farmId);
        }
        return vault;
    }

    /** 공통 트랜잭션 전송 */
    private String sendTx(String to, Function f) throws Exception {
        String data = FunctionEncoder.encode(f);
        var receipt = tx.sendTransaction(
                gas.getGasPrice(),           // 테스트넷 기본 가스 (운영은 커스텀 권장)
                gas.getGasLimit(),
                to,
                data,
                BigInteger.ZERO
        );
        if (receipt.hasError()) {
            throw new RuntimeException("Tx error: " + receipt.getError().getMessage());
        }
        return receipt.getTransactionHash();
    }

    /** KRW → 토큰 (18 decimals) : amount = (krw / krwPerToken) * 10^18 */
    private BigInteger toTokenAmount(long krw) {
        BigDecimal tokens = BigDecimal.valueOf(krw).divide(BigDecimal.valueOf(krwPerToken));
        return tokens.multiply(BigDecimal.TEN.pow(18)).toBigInteger();
    }

    private boolean isZeroAddress(String addr) {
        return addr == null || addr.equalsIgnoreCase("0x0000000000000000000000000000000000000000");
    }
}
