package com.e105.majoong.common.model.myScore;

import com.e105.majoong.farm.dto.out.ScoreHistoryAvgResponseDto;
import com.e105.majoong.farm.dto.out.ScoreHistoryResponseDto;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.e105.majoong.common.model.myScore.QMyScore.myScore;
import static com.e105.majoong.common.model.scoreCategory.QScoreCategory.scoreCategory;

@Repository
@RequiredArgsConstructor
public class MyScoreRepositoryImpl implements MyScoreRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<ScoreHistoryAvgResponseDto> findMonthlyScoreHistory(String farmUuid, Integer year) {
        return queryFactory
                .select(Projections.constructor(
                        ScoreHistoryAvgResponseDto.class,
                        myScore.year,
                        myScore.month,
                        myScore.score.avg()
                ))
                .from(myScore)
                .where(
                        myScore.farmUuid.eq(farmUuid),
                        myScore.year.eq(year)
                )
                .groupBy(myScore.year, myScore.month)
                .orderBy(myScore.month.asc())
                .fetch();
    }

    @Override
    public List<ScoreHistoryResponseDto> findScoreHistory(String farmUuid, Integer year, Integer month) {
        return queryFactory
                .select(Projections.constructor(
                        ScoreHistoryResponseDto.class,
                        // CONCAT('USE-', DATE_FORMAT(...), '-', id)
                        Expressions.stringTemplate(
                                "concat('USE-', DATE_FORMAT({0}, '%Y%m%d'), '-', {1})",
                                myScore.createdAt, myScore.id
                        ),
                        myScore.createdAt,
                        scoreCategory.category,
                        myScore.score,
                        myScore.month,
                        myScore.year,
                        myScore.delta
                ))
                .from(myScore)
                .join(scoreCategory).on(scoreCategory.id.eq(myScore.scoreCategoryId))
                .where(
                        myScore.farmUuid.eq(farmUuid),
                        myScore.year.eq(year),
                        month != null ? myScore.month.eq(month) : null
                )
                .orderBy(myScore.createdAt.desc())
                .fetch();
    }
}
