package com.e105.majoong.common.model.myScore;

import com.e105.majoong.farm.dto.out.ScoreHistoryResponseDto;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MyScoreRepository extends JpaRepository<MyScore, Long> {
    List<MyScore> findByFarmUuid(String farmUuid);
    Optional<MyScore> findFirstByFarmUuidOrderByYearDescMonthDesc(String farmUuid);
    Optional<MyScore> findByFarmUuidAndYearAndMonth(String farmUuid, Integer year, Integer month);

    @Query("""
        SELECT new com.e105.majoong.farm.dto.out.ScoreHistoryResponseDto(
            ms.year, ms.month, AVG(ms.Score)
        )
        FROM MyScore ms
        WHERE ms.farmUuid = :farmUuid
          AND ms.year = :year
        GROUP BY ms.year, ms.month
        ORDER BY ms.month ASC
    """)
    List<ScoreHistoryResponseDto> findMonthlyScoreHistory(
            @Param("farmUuid") String farmUuid,
            @Param("year") int year
    );


}
