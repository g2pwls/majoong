package com.e105.machimnae.common.crypto;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

@Component
public class AesGcm {

  private static final String TRANSFORMATION = "AES/GCM/NoPadding";
  private static final int IV_LEN = 12;       // 96bit 권장
  private static final int TAG_LEN = 128;     // 128bit 권장

  private final byte[] key;
  private final SecureRandom secureRandom = new SecureRandom();

  public AesGcm(@Value("${security.keystoreEncryptKey}") String base64Key) {
    this.key = Base64.getDecoder().decode(base64Key);
    if (this.key.length != 32) {
      throw new IllegalArgumentException("keystoreEncryptKey must be 32 bytes (base64-decoded)");
    }
  }

  /** 평문 -> base64( iv || ciphertext+tag ) */
  public String encrypt(String plain) {
    try {
      byte[] iv = new byte[IV_LEN];
      secureRandom.nextBytes(iv);

      Cipher cipher = Cipher.getInstance(TRANSFORMATION);
      cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(TAG_LEN, iv));
      byte[] enc = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));

      ByteBuffer buf = ByteBuffer.allocate(iv.length + enc.length);
      buf.put(iv).put(enc);
      return Base64.getEncoder().encodeToString(buf.array());
    } catch (Exception e) {
      throw new RuntimeException("AES-GCM encrypt error", e);
    }
  }

  /** base64( iv || ciphertext+tag ) -> 평문 */
  public String decrypt(String encBase64) {
    try {
      byte[] all = Base64.getDecoder().decode(encBase64);
      byte[] iv = Arrays.copyOfRange(all, 0, IV_LEN);
      byte[] enc = Arrays.copyOfRange(all, IV_LEN, all.length);

      Cipher cipher = Cipher.getInstance(TRANSFORMATION);
      cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(TAG_LEN, iv));
      byte[] dec = cipher.doFinal(enc);
      return new String(dec, StandardCharsets.UTF_8);
    } catch (Exception e) {
      throw new RuntimeException("AES-GCM decrypt error", e);
    }
  }
}
