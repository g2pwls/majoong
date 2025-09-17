package com.e105.majoong.manageFarm.dto.out;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FarmInfoResponseDto {
    private String farmUuid;
    private String farmName;
    private String imageUrl;

}
