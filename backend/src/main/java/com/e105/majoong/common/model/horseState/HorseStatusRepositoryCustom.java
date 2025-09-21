package com.e105.majoong.common.model.horseState;

import com.e105.majoong.batch.score.horseState.dto.HorseWithHorseStatusDto;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface HorseStatusRepositoryCustom {
    List<HorseWithHorseStatusDto> getUploadedHorseStatusByWeek(LocalDateTime start, LocalDateTime end);
}
