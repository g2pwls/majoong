package com.e105.majoong.manageFarm.dto.out;

import com.e105.majoong.common.model.horseState.HorseState;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HorseImageDto {
    private String horseNumber;
    private String frontImage;
    private String leftSideImage;
    private String rightSideImage;
    private String stableImage;

    public static HorseImageDto toDto(HorseState horseState) {
        return HorseImageDto.builder()
                .horseNumber(horseState.getHorseNumber())
                .frontImage(horseState.getFrontImage())
                .leftSideImage(horseState.getLeftSideImage())
                .rightSideImage(horseState.getRightSideImage())
                .stableImage(horseState.getStableImage())
                .build();
    }
}
