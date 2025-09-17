package com.e105.majoong.manageFarm.dto.out;

import com.e105.majoong.common.model.farm.Farm;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class GeoDto {
    private Double latitude;
    private Double longitude;

    public static GeoDto toDto(Farm farm) {
        return GeoDto.builder()
                .latitude(farm.getLatitude())
                .longitude(farm.getLongitude())
                .build();
    }
}
