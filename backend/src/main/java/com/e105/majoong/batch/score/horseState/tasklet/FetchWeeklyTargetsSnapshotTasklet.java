package com.e105.majoong.batch.score.horseState.tasklet;

import com.e105.majoong.batch.score.horseState.dto.HorseInFarmDto;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.common.model.horse.HorseRepositoryCustom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FetchWeeklyTargetsSnapshotTasklet implements Tasklet {

    private final FarmRepository farmRepository;
    private final HorseRepositoryCustom horseRepositoryCustom;
    private final ZoneId KST = ZoneId.of("Asia/Seoul");

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        String weekRefDate = chunkContext.getStepContext().getStepExecution().getJobParameters()
                .getString("weekRefDate");
        if (weekRefDate == null) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_JOB_PARAMETER);
        }
        LocalDate monday = LocalDate.parse(weekRefDate);
        LocalDateTime start = monday.minusDays(3).atStartOfDay(KST).toLocalDateTime();
        LocalDateTime end = monday.minusDays(1)
                .atTime(23, 59, 59, 999_000_000)
                .atZone(KST).toLocalDateTime();

        List<Farm> farms = farmRepository.findAll();
        List<HorseInFarmDto> horseInFarm = horseRepositoryCustom.findActiveHorsesAt(start, end);

        Map<String, Set<String>> horsesByFarm = new HashMap<>();
        for (Farm farm : farms) {
            horsesByFarm.put(farm.getFarmUuid(), new LinkedHashSet<>());
        }
        for (HorseInFarmDto dto : horseInFarm) {
            horsesByFarm.get(dto.getFarmUuid()).add(dto.getHorseNumber());
        }

        var executeContext = chunkContext.getStepContext().getStepExecution()
                .getJobExecution().getExecutionContext();

        executeContext.put("WEEK_HORSE_SNAPSHOT", horsesByFarm);
        executeContext.putString("WEEK_START", start.toString());
        executeContext.putString("WEEK_END", end.toString());
        executeContext.putString("WEEK_LABEL", monday.minusDays(3).toString()); //금요일
        return RepeatStatus.FINISHED;
    }
}
