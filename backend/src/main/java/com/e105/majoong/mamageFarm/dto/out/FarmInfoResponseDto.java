package com.e105.majoong.mamageFarm.dto.out;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FarmInfoResponseDto {
    private String farmUuid;
    private String farmName;
    private String imageUrl;

}
