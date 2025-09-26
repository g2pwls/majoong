package com.e105.majoong.common.model.horse;

import com.e105.majoong.batch.score.horseState.dto.HorseInFarmDto;
import com.e105.majoong.common.model.farm.QFarm;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class HorseRepositoryImpl implements HorseRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QHorse horse = QHorse.horse;
    private final QFarm farm = QFarm.farm;

    @Override
    public List<HorseInFarmDto> findActiveHorsesAt(
            LocalDateTime friday, LocalDateTime sunday) {

        return queryFactory
                .select(Projections.constructor(HorseInFarmDto.class,
                        farm.farmUuid,
                        horse.horseNumber))
                .from(horse)
                .join(horse.farm, farm)
                .where(horse.createdAt.lt(friday),
                        horse.deletedAt.isNull().or(horse.deletedAt.gt(sunday)))
                .fetch();
    }
}
