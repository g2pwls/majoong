package com.e105.majoong.blockchain.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;
import org.web3j.utils.Numeric;

@Configuration
public class Web3Config {

    @Value("${chain.rpcUrl}")
    private String rpcUrl;

    @Value("${chain.chainId}")
    private long chainId;

    @Value("${web3.adminPrivateKey}")
    private String adminPrivateKey;

    @Bean
    public Web3j web3j() {
        return Web3j.build(new HttpService(rpcUrl));
    }

    @Bean
    public Credentials adminCredentials(@Value("${web3.adminPrivateKey}") String pk) {
      String clean = Numeric.cleanHexPrefix(pk == null ? "" : pk.trim());
      if (!clean.matches("(?i)^[0-9a-f]{64}$")) {
        throw new IllegalArgumentException("web3.adminPrivateKey must be 64-hex (optionally 0x-prefixed)");
      }
      Credentials creds = Credentials.create(clean);
      // 부팅 시 주소 찍어서 눈으로 확인
      System.out.println("[WEB3] Admin address = " + creds.getAddress());
      return creds;
    }
    @Bean
    public TransactionManager txManager(Web3j web3j, Credentials adminCredentials) {
        // EIP-155 서명 + nonce 관리
        return new RawTransactionManager(web3j, adminCredentials, chainId);
    }

    @Bean
    public DefaultGasProvider gasProvider() {
        // 테스트넷 기본 가스. 운영 시 커스텀 가스전략으로 교체 권장
        return new DefaultGasProvider();
    }
}
