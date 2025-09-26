package com.e105.majoong.common.model.collection;

import com.e105.majoong.common.model.farm.QFarm;
import com.e105.majoong.common.model.horse.Horse;
import com.e105.majoong.common.model.horse.QHorse;
import com.e105.majoong.mypage.dto.out.HorseInFarmResponseDto;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CollectionCardRepositoryImpl implements CollectionCardRepositoryCustom{
    private final JPAQueryFactory queryFactory;
    private final QHorse horse = QHorse.horse;
    private final QFarm farm = QFarm.farm;
    private final QCollectionCard collectionCard = QCollectionCard.collectionCard;


    @Override
    public List<HorseInFarmResponseDto> getCollectionList(String memberUuid, String farmUuid) {
        return queryFactory.select(Projections.constructor(
                        HorseInFarmResponseDto.class,
                        farm.farmName,
                        horse.horseNumber,
                        horse.horseName,
                        horse.profileImage,
                        horse.birth,
                        horse.raceCount,
                        horse.gender,
                        horse.breed,
                        horse.totalPrize,
                        horse.firstRaceDate,
                        horse.lastRaceDate
                ))
                .from(horse)
                .join(collectionCard).on(collectionCard.horseNumber.eq(horse.horseNumber))
                .join(horse.farm, farm)
                .where(
                        collectionCard.memberUuid.eq(memberUuid),
                        farm.farmUuid.eq(farmUuid),
                        horse.deletedAt.isNull()
                )
                .orderBy(collectionCard.createdAt.desc())
                .fetch();
    }
}
