package com.e105.majoong.common.model.horseState;

import com.e105.majoong.batch.score.horseState.dto.HorseWithHorseStatusDto;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class HorseStatusRepositoryImpl implements HorseStatusRepositoryCustom {
    private final JPAQueryFactory queryFactory;
    private final QHorseState horseState = QHorseState.horseState;

    @Override
    public List<HorseWithHorseStatusDto> getUploadedHorseStatusByWeek(LocalDateTime start, LocalDateTime end) {
        return null;
    }
}
