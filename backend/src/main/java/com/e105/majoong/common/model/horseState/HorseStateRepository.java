package com.e105.majoong.common.model.horseState;

import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface HorseStateRepository extends JpaRepository<HorseState, Long> {
    @Query("""
        SELECT hs
        FROM HorseState hs
        WHERE hs.horseNumber = :horseNumber
          AND hs.farmUuid = :farmUuid
          AND hs.uploadedAt BETWEEN :start AND :end
    """)
    List<HorseState> findByHorseAndFarmAndPeriod(
            @Param("horseNumber") Long horseNumber,
            @Param("farmUuid") String farmUuid,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
