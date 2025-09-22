package com.e105.majoong.batch.score.horseState.dto;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class HorseWithHorseStatusDto {
    private String farmUuid;
    private Long horseNumber;
}
