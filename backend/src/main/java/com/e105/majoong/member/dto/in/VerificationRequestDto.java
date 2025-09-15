package com.e105.majoong.member.dto.in;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VerificationRequestDto {
    private String businessNum;
    private String openingDate;
    private String name;
    private String farmName;
}