package com.e105.majoong.blockchain.service;

import com.e105.majoong.blockchain.props.Web3Props;
import com.e105.majoong.common.crypto.AesGcm;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.web3j.crypto.ECKeyPair;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Wallet;
import org.web3j.crypto.WalletFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {

  private final Web3Props web3Props;   // web3.keystoreDir 사용
  private final AesGcm aes;            // security.keystoreEncryptKey 사용
  private final ObjectMapper objectMapper; // Spring이 제공하는 Jackson 빈

  public CreatedWallet createCustodialWallet() {
    try {
      // 1) 키쌍 생성
      ECKeyPair keyPair = Keys.createEcKeyPair();
      String address = "0x" + Keys.getAddress(keyPair.getPublicKey());

      // 2) keystore JSON 생성 (임시 패스워드 — 저장하지 않음)
      String password = UUID.randomUUID().toString();
      WalletFile walletFile = Wallet.createStandard(password, keyPair);
      String keystoreJson = objectMapper.writeValueAsString(walletFile);

      // 3) DB에 저장할 암호문
      String cipher = aes.encrypt(keystoreJson);

      return new CreatedWallet(address, cipher);
    } catch (Exception e) {
      throw new RuntimeException("지갑 생성 실패", e);
    }
  }

  public record CreatedWallet(String address, String keystoreCipher) {}
}