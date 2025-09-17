package com.e105.majoong.farm.dto.out;

import com.e105.majoong.common.model.myScore.MyScore;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyScoreResponseDto {
    private int year;
    private int month;
    private double score;

    public static MonthlyScoreResponseDto toDto(MyScore myScore) {
        return MonthlyScoreResponseDto.builder()
                .year(myScore.getYear())
                .month(myScore.getMonth())
                .score(myScore.getScore())
                .build();
    }
}
