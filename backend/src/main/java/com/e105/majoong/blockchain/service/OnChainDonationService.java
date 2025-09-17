package com.e105.majoong.blockchain.service;

import com.e105.majoong.blockchain.props.ChainProps;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class OnChainDonationService {

  private final Web3j web3j;
  private final Credentials admin;      // Web3Config에서 주입됨 (DEPLOYER_PRIVATE_KEY)
  private final ChainProps chainProps;  // tokenAddress/chainId/…

  // DonationRecorded(address indexed donor, address indexed vault, uint256 amount)
  private static final Event DONATION_RECORDED = new Event(
      "DonationRecorded",
      Arrays.asList(
          new TypeReference<Address>(true) {}, // donor (indexed)
          new TypeReference<Address>(true) {}, // vault (indexed)
          new TypeReference<Uint256>() {}      // amount
      )
  );
  /**
   * MaronToken.mintToVaultForDonor(donor, vault, amountWei)
   */
  public String mintToVaultForDonor(String donor, String vault, BigInteger amountWei) throws Exception {
    Function fn = new Function(
        "mintToVaultForDonor",
        Arrays.asList(new Address(donor), new Address(vault), new Uint256(amountWei)),
        Collections.emptyList()
    );
    String data = FunctionEncoder.encode(fn);

    BigInteger nonce = web3j.ethGetTransactionCount(
        admin.getAddress(), DefaultBlockParameterName.PENDING
    ).send().getTransactionCount();

    // EIP-1559 샘플 파라미터 (테스트넷 상황에 맞게 조정)
    BigInteger gasLimit     = BigInteger.valueOf(220_000);
    BigInteger maxPriority  = BigInteger.valueOf(1_500_000_000L);
    BigInteger maxFee       = BigInteger.valueOf(30_000_000_000L);

    RawTransaction raw = RawTransaction.createTransaction(
        chainProps.getChainId(), nonce, gasLimit,
        chainProps.getTokenAddress(), BigInteger.ZERO, data,
        maxPriority, maxFee
    );

    byte[] signed = TransactionEncoder.signMessage(raw, chainProps.getChainId(), admin);
    EthSendTransaction res = web3j.ethSendRawTransaction(Numeric.toHexString(signed)).send();

    if (res.hasError()) throw new RuntimeException("mintToVaultForDonor failed: " + res.getError().getMessage());
    return res.getTransactionHash();
  }
}
