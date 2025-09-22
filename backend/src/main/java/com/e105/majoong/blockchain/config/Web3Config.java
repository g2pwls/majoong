package com.e105.majoong.blockchain.config;

import com.e105.majoong.blockchain.props.ChainProps;
import com.e105.majoong.blockchain.props.Web3Props;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class Web3Config {

  private final ChainProps chainProps;
  private final Web3Props web3Props;

  @Bean
  public Web3j web3j() {
    return Web3j.build(new HttpService(chainProps.getRpcUrl()));
  }

  @Bean
  public Credentials adminCredentials() {
    String pk = web3Props.getAdminPrivateKey();
    String clean = Numeric.cleanHexPrefix(pk == null ? "" : pk.trim());
    if (!clean.matches("(?i)^[0-9a-f]{64}$")) {
      throw new IllegalArgumentException("web3.adminPrivateKey must be 64-hex (optionally 0x-prefixed)");
    }
    Credentials creds = Credentials.create(clean);
    System.out.println("[WEB3] Admin address = " + creds.getAddress());
    return creds;
  }

  @Bean
  public TransactionManager txManager(Web3j web3j, Credentials adminCredentials) {
    return new RawTransactionManager(web3j, adminCredentials, chainProps.getChainId());
  }

  @Bean
  public DefaultGasProvider gasProvider() {
    return new DefaultGasProvider();
  }
}
