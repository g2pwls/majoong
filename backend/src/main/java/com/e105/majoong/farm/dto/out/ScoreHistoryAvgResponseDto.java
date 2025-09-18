package com.e105.majoong.farm.dto.out;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ScoreHistoryAvgResponseDto {
    private int year;
    private int month;
    private Double avgScore;
}