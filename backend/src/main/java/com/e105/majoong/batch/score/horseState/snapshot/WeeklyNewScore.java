package com.e105.majoong.batch.score.horseState.snapshot;

import java.io.Serializable;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class WeeklyNewScore implements Serializable {
    private static final long serialVersionUID = 1L;

    private Double lastScore;
    private int delta;
    private Double newScore;
    private List<Long> horseNumber;

    public static WeeklyNewScore toSnapshot(
            Double lastScore, int delta, Double newScore, List<Long> horseNumber) {
        return WeeklyNewScore.builder()
                .lastScore(lastScore)
                .delta(delta)
                .newScore(newScore)
                .horseNumber(horseNumber)
                .build();
    }
}
