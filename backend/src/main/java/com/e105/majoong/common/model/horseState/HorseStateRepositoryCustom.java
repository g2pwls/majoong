package com.e105.majoong.common.model.horseState;

import java.time.LocalDateTime;
import java.util.List;

public interface HorseStateRepositoryCustom {
    List<HorseState> findByHorseAndFarmAndPeriod(
            String horseNumber,
            String farmUuid,
            LocalDateTime start,
            LocalDateTime end
    );
}
