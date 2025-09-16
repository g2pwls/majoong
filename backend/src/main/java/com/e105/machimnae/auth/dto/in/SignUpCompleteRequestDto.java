package com.e105.machimnae.auth.dto.in;

import com.e105.machimnae.member.entity.Donator;
import com.e105.machimnae.member.entity.Farmer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignUpCompleteRequestDto {
  private String role;
  private String name;
  private String email;

  // ── farmer 전용 추가 필드 ──
  private String farmName;
  private String businessNum;
  private LocalDate openingAt;

  public Farmer toFarmer(String memberUuid) {
    return Farmer.builder()
        .memberUuid(memberUuid)
        .name(name)
        .farmName(farmName)
        .businessNum(businessNum)
        .openingAt(openingAt)
        .email(email)
        .build();
  }

  public Donator toDonator(String memberUuid) {
    return Donator.builder()
        .memberUuid(memberUuid)
        .name(name)
        .email(email)
        .build();
  }
}
