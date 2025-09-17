package com.e105.majoong.donation.dto.in;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class DonationRequestDto {
  @NotBlank
  private String memberUuid;       // 기부자(로그인 사용자) UUID

  @NotBlank
  private String farmMemberUuid;   // 목장주 member_uuid (farm.member_uuid)

  @Min(1000)
  private long amountKrw;          // 1000원 단위
}