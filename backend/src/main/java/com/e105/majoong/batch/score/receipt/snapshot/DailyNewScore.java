package com.e105.majoong.batch.score.receipt.snapshot;

import com.fasterxml.jackson.databind.ser.Serializers.Base;
import java.io.Serializable;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DailyNewScore implements Serializable {
    private static final long serialVersionUID = 1L;

    private Double lastScore;
    private int delta;
    private Double newScore;

    public static DailyNewScore toSnapshot(
            Double lastScore, int delta, Double newScore) {
        return DailyNewScore.builder()
                .lastScore(lastScore)
                .delta(delta)
                .newScore(newScore)
                .build();
    }
}
