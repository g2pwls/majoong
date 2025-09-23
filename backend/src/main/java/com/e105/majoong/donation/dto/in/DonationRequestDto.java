package com.e105.majoong.donation.dto.in;

import com.e105.majoong.common.model.donationHistory.DonationHistory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class DonationRequestDto {

  @NotBlank
  private String farmUuid;   // 목장주 farm_uuid (farm.farm_uuid)

  @Min(1000)
  private long amountKrw;          // 원화 금액 (정책: 예) 1000원 = 1 토큰)

  public DonationHistory toEntity(
      String farmUuid,
      String farmerUuid,
      String donatorUuid,  // ★ 추가
      String txHash,
      long tokenCount,
      long balance
  ) {
    return DonationHistory.builder()
        .donationToken(tokenCount)
        .donatorUuid(donatorUuid)
        .farmUuid(farmUuid)
        .farmerUuid(farmerUuid)
        .txHash(txHash)
        .balance(balance)
        .build();
  }
}
