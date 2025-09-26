package com.e105.majoong.farm.dto.out;

import com.e105.majoong.common.model.farm.Farm;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class FarmRecommendResponseDto {
    private String farmUuid;
    private String profileImage;
    private String farmName;
    private Double totalScore;
    private String address;
    private String description;
    private String farmerName;
    private int horseCount;

    public static FarmRecommendResponseDto toDto(Farm farm, String farmerName) {
        return FarmRecommendResponseDto.builder()
                .farmUuid(farm.getFarmUuid())
                .profileImage(farm.getProfileImage())
                .farmName(farm.getFarmName())
                .address(farm.getAddress())
                .description(farm.getDescription())
                .totalScore(farm.getTotalScore())
                .farmerName(farmerName)
                .horseCount(farm.getHorseCount())
                .build();
    }
}
