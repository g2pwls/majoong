package com.e105.majoong.batch.score.horseState.snapshot;

import java.util.Set;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FarmSnapshot {
    private String farmUuid;
    private Set<String> horses;

    public static FarmSnapshot toSnapshot(String farmUuid, Set<String> horses) {
        return FarmSnapshot.builder()
                .farmUuid(farmUuid)
                .horses(horses)
                .build();
    }
}
