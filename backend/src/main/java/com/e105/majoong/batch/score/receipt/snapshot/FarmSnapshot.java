package com.e105.majoong.batch.score.receipt.snapshot;

import java.io.Serializable;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class FarmSnapshot implements Serializable {
    private static final long serialVersionUID = 1L;

    private String memberUuid;
    private Double totalScore;

    public static FarmSnapshot toSnapshot(String memberUuid, Double totalScore) {
        return FarmSnapshot.builder()
                .memberUuid(memberUuid)
                .totalScore(totalScore)
                .build();
    }
}
