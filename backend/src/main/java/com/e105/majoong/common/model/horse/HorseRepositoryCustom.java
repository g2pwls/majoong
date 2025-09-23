package com.e105.majoong.common.model.horse;

import com.e105.majoong.batch.score.horseState.dto.HorseInFarmDto;
import java.time.LocalDateTime;
import java.util.List;

public interface HorseRepositoryCustom {
    List<HorseInFarmDto> findActiveHorsesAt(LocalDateTime friday, LocalDateTime sunday);
}
