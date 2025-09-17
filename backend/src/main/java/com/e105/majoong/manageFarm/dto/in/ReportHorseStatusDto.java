package com.e105.majoong.manageFarm.dto.in;

import com.e105.majoong.common.model.horseState.HorseState;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReportHorseStatusDto {
    private String frontImage;
    private String leftSideImage;
    private String rightSideImage;
    private String stableImage;
    private String content;

    public HorseState toEntity(String farmUuid, String memberUuid, Long horseNumber) {
        return HorseState.builder()
                .farmUuid(farmUuid)
                .memberUuid(memberUuid)
                .horseNumber(horseNumber)
                .frontImage(frontImage)
                .leftSideImage(leftSideImage)
                .rightSideImage(rightSideImage)
                .stableImage(stableImage)
                .content(content)
                .build();
    }
}
