// com.e105.majoong.blockchain.service.WalletService
package com.e105.majoong.blockchain.service;

import com.e105.majoong.blockchain.props.Web3Props;
import com.e105.majoong.common.crypto.AesGcm;
import com.e105.majoong.common.model.farmer.FarmerRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.web3j.crypto.*;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {

  private final Web3Props web3Props;
  private final AesGcm aes;
  private final ObjectMapper objectMapper;
  private final FarmerRepository farmerRepository;

  public CreatedWallet createCustodialWallet() {
    try {
      ECKeyPair keyPair = Keys.createEcKeyPair();
      String address = "0x" + Keys.getAddress(keyPair.getPublicKey());
      String password = UUID.randomUUID().toString();
      WalletFile walletFile = Wallet.createStandard(password, keyPair);
      String keystoreJson = objectMapper.writeValueAsString(walletFile);
      String cipher = aes.encrypt(keystoreJson);
      return new CreatedWallet(address, cipher);
    } catch (Exception e) {
      throw new RuntimeException("지갑 생성 실패", e);
    }
  }

  /** memberUuid → farmer 지갑 주소 조회 */
  public String getAddressByMemberUuid(String memberUuid) {
    return farmerRepository.findWalletAddressByMemberUuid(memberUuid)
        .filter(addr -> !addr.isBlank())
        .orElseThrow(() -> new IllegalStateException("지갑주소 없음: " + memberUuid));
  }

  public record CreatedWallet(String address, String keystoreCipher) {}
}
