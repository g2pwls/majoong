package com.e105.majoong.donation.dto.in;

import com.e105.majoong.common.model.donationHistory.DonationHistory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class DonationRequestDto {
  @NotBlank
  private String memberUuid;       // 기부자(로그인 사용자) UUID

  @NotBlank
  private String farmMemberUuid;   // 목장주 member_uuid (farm.member_uuid)

  @Min(1000)
  private long amountKrw;

  public DonationHistory toEntity(String farmUuid, String farmerUuid, String txHash, long tokenCount) {
    return DonationHistory.builder()
        .donationToken(tokenCount)
        .donatorUuid(this.memberUuid)
        .farmUuid(farmUuid)
        .farmerUuid(farmerUuid)
        .txHash(txHash)
        .build();
  }// 1000원 단위
}