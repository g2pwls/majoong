package com.e105.majoong.batch.score.receipt.tasklet;

import com.e105.majoong.batch.score.receipt.snapshot.FarmSnapshot;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farm.FarmRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FetchDailyTargetsSnapshotTasklet implements Tasklet {

    private final FarmRepository farmRepository;
    private final ZoneId KST = ZoneId.of("Asia/Seoul");

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {

        String target = chunkContext.getStepContext().getStepExecution().getJobParameters()
                .getString("targetDate");
        if (target == null) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_JOB_PARAMETER);
        }
        LocalDate targetDate = LocalDate.parse(target);
        LocalDateTime start = targetDate.atStartOfDay(KST).toLocalDateTime();
        LocalDateTime end = targetDate.atTime(23, 59, 59, 999_000_000)
                .atZone(KST).toLocalDateTime();

        Map<String, FarmSnapshot> farmSnapshotMap = new LinkedHashMap<>();

        List<Farm> farmList = farmRepository.findAll();
        for (Farm farm : farmList) {
            FarmSnapshot farmSnapshot = FarmSnapshot.toSnapshot(farm.getMemberUuid(), farm.getTotalScore());
            farmSnapshotMap.put(farm.getFarmUuid(), farmSnapshot);
        }

        var executeContext = chunkContext.getStepContext().getStepExecution()
                .getJobExecution().getExecutionContext();

        executeContext.putString("TARGET_DATE", targetDate.toString());
        executeContext.putString("WINDOW_START", start.toString());
        executeContext.putString("WINDOW_END", end.toString());
        executeContext.put("FARM_SNAPSHOT", farmSnapshotMap);
        return RepeatStatus.FINISHED;
    }
}
