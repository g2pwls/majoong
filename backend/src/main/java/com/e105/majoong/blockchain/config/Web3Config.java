package com.machimnae.blockchain.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;

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
    public Credentials adminCredentials() {
        return Credentials.create(adminPrivateKey);
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
