package com.e105.majoong.batch.score.horseState.tasklet;

import com.e105.majoong.batch.score.horseState.dto.HorseWithHorseStatusDto;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.horseState.HorseStateRepository;
import com.e105.majoong.common.model.horseState.HorseStatusRepositoryCustom;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
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
public class AggregateWeeklyHorseStatusUploadsTasklet implements Tasklet {

    private final HorseStatusRepositoryCustom horseStateRepositoryCustom;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {

        var executeContext = chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext();
        String start = executeContext.getString("WEEK_START", null);
        String end = executeContext.getString("WEEK_END", null);
        if (start == null || end == null) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_JOB_PARAMETER);
        }

        LocalDateTime weekStart = LocalDateTime.parse(start);
        LocalDateTime weekEnd = LocalDateTime.parse(end);

        List<HorseWithHorseStatusDto> dtos = horseStateRepositoryCustom
                .getUploadedHorseStatusByWeek(weekStart, weekEnd);

        Map<String, Set<String>> horseStatusByFarm = new LinkedHashMap<>();
        for (HorseWithHorseStatusDto dto : dtos) {
            if (!horseStatusByFarm.containsKey(dto.getFarmUuid())) {
                horseStatusByFarm.put(dto.getFarmUuid(), new LinkedHashSet<>());
            }
            horseStatusByFarm.get(dto.getFarmUuid()).add(dto.getHorseNumber());
        }

        //농장 중 업로드 하지 않는 농장도 포함
        @SuppressWarnings("unchecked")
        Map<String, Set<String>> snapshot = (Map<String, Set<String>>) executeContext.get("WEEK_HORSE_SNAPSHOT");
        if (snapshot != null) {
            for (String farmUuid : snapshot.keySet()) {
                horseStatusByFarm.computeIfAbsent(farmUuid, k -> new LinkedHashSet<>());
            }
        }

        executeContext.put("WEEK_UPLOADED", horseStatusByFarm);
        return RepeatStatus.FINISHED;
    }
}
