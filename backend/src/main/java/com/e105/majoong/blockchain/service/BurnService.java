package com.e105.majoong.blockchain.service;

import com.e105.majoong.blockchain.props.ChainProps;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class BurnService {
  private final TransactionManager txManager;   // Web3Config에서 RawTransactionManager 주입
  private final DefaultGasProvider gasProvider; // Web3Config에서 주입
  private final ChainProps chainProps;          // tokenAddress 포함

  /** MaronToken.burnFromFarmer(farmer, amountWei) 호출 */
  public String burnFromFarmer(String farmerAddress, BigInteger amountWei) {
    try {
      Function fn = new Function(
          "burnFromFarmer",
          Arrays.asList(new Address(farmerAddress), new Uint256(amountWei)),
          Collections.emptyList()
      );
      String data = FunctionEncoder.encode(fn);

      String txHash = ((RawTransactionManager) txManager)
          .sendTransaction(
              gasProvider.getGasPrice(),
              BigInteger.valueOf(200_000L),
              chainProps.getTokenAddress(),
              data,
              BigInteger.ZERO
          ).getTransactionHash();

      log.info("[BURN] sent tx: {}", txHash);
      return txHash;
    } catch (Exception e) {
      throw new RuntimeException("burnFromFarmer failed", e);
    }
  }
}
