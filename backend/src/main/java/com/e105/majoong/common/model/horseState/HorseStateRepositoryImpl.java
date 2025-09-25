package com.e105.majoong.common.model.horseState;

import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import static com.e105.majoong.common.model.horseState.QHorseState.horseState;

@Repository
@RequiredArgsConstructor
public class HorseStateRepositoryImpl implements HorseStateRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<HorseState> findByHorseAndFarmAndPeriod(
            String horseNumber,
            String farmUuid,
            LocalDateTime start,
            LocalDateTime end
    ) {
        return queryFactory
                .selectFrom(horseState)
                .where(
                        horseState.horseNumber.eq(horseNumber),
                        horseState.farmUuid.eq(farmUuid),
                        horseState.uploadedAt.between(start, end)
                )
                .fetch();
    }
}