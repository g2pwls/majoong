package com.e105.machimnae.blockchain.props;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "chain")
@Getter
@Setter
public class ChainProps {
  private String rpcUrl;
  private Long chainId;
  private String tokenAddress;
  private String factoryAddress;
  private Long krwPerToken;
}