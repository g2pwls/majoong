package com.e105.majoong.common.model.myScore;

import com.e105.majoong.farm.dto.out.ScoreHistoryAvgResponseDto;
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
        SELECT new com.e105.majoong.farm.dto.out.ScoreHistoryAvgResponseDto(
            ms.year, ms.month, AVG(ms.score)
        )
        FROM MyScore ms
        WHERE ms.farmUuid = :farmUuid
          AND ms.year = :year
        GROUP BY ms.year, ms.month
        ORDER BY ms.month ASC
    """)
    List<ScoreHistoryAvgResponseDto> findMonthlyScoreHistory(
            @Param("farmUuid") String farmUuid,
            @Param("year") int year
    );

    @Query(value = """
        SELECT new com.e105.majoong.farm.dto.out.ScoreHistoryResponseDto(
            CONCAT('USE-', FUNCTION('DATE_FORMAT', ms.createdAt, '%Y%m%d'), '-', ms.id),
            ms.createdAt,
            sc.category,
            ms.score
        )
        FROM MyScore ms
        JOIN ScoreCategory sc ON sc.id = ms.scoreCategoryId
        WHERE ms.farmUuid = :farmUuid
        ORDER BY ms.createdAt DESC
    """)
    List<ScoreHistoryResponseDto> findScoreHistory(@Param("farmUuid") String farmUuid);

}
