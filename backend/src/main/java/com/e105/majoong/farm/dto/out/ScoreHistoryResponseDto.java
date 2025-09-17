package com.e105.majoong.farm.dto.out;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ScoreHistoryResponseDto {
    private int year;
    private int month;
    private double score; // AVG 결과는 Double
}