package com.e105.machimnae.blockchain.props;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "web3")
@Getter
@Setter
public class Web3Props {
  private String adminPrivateKey;
  private String keystoreDir;
}