package com.e105.majoong.farm.dto.out;

import com.e105.majoong.common.model.farm.Farm;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class FarmRecommendRequestDto {
    private String farmUuid;
    private String profileImage;
    private String farmName;
    private Double totalScore;
    private String address;
    private String description;

    public static FarmRecommendRequestDto toDto(Farm farm) {
        return FarmRecommendRequestDto.builder()
                .farmUuid(farm.getFarmUuid())
                .profileImage(farm.getProfileImage())
                .farmName(farm.getFarmName())
                .address(farm.getAddress())
                .description(farm.getDescription())
                .totalScore(farm.getTotalScore())
                .build();
    }
}
