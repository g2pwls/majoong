package com.e105.majoong.donation.dto.out;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DonationResponseDto {
  private final String txHash;
  private final String fromAddress;
  private final String vaultAddress;
  private final String tokenAmount; // 사람이 읽는 토큰 수량(소수)
  private final String amountWei;   // 정밀값(wei)
}
