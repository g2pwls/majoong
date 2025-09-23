package com.e105.majoong.score.dto.in;

import com.e105.majoong.common.model.myScore.MyScore;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class CreateScoreDto {
    private String farmUuid;
    private String memberUuid;
    private Long scoreCategoryId;
    private Double score;
    private int delta;
    private int year;
    private int month;

    public static CreateScoreDto toDto(
            String farmUuid, String memberUuid, Long scoreCategoryId, Double score, int delta, int year, int month) {
        return CreateScoreDto.builder()
                .farmUuid(farmUuid)
                .memberUuid(memberUuid)
                .scoreCategoryId(scoreCategoryId)
                .score(score)
                .delta(delta)
                .year(year)
                .month(month)
                .build();
    }

    public MyScore toEntity() {
        return MyScore.builder()
                .farmUuid(farmUuid)
                .memberUuid(memberUuid)
                .scoreCategoryId(scoreCategoryId)
                .delta(delta)
                .score(score)
                .year(year)
                .month(month)
                .build();
    }
}
