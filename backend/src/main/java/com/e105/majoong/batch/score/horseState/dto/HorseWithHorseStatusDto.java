package com.e105.majoong.batch.score.horseState.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
@AllArgsConstructor
public class HorseWithHorseStatusDto {
    private String farmUuid;
    private String horseNumber;
}
