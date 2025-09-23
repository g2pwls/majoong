package com.e105.majoong.batch.score.receipt.tasklet;

import com.e105.majoong.batch.score.receipt.snapshot.DailyNewScore;
import com.e105.majoong.batch.score.receipt.snapshot.FarmSnapshot;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CalculateDailyDeltaTasklet implements Tasklet {

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        var executeContext = chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext();

        Map<String, FarmSnapshot> farmSnapshot =
                (Map<String, FarmSnapshot>) executeContext.get("FARM_SNAPSHOT");
        Map<String, Long> receiptCnt =
                (Map<String, Long>) executeContext.get("DAILY_RECEIPT_CNT");

        if (farmSnapshot == null || receiptCnt == null) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_JOB_PARAMETER);
        }

        Map<String, DailyNewScore> result = new LinkedHashMap<>();

        for(var entry: farmSnapshot.entrySet()) {
            String farmUuid = entry.getKey();
            FarmSnapshot snap = entry.getValue();

            int delta = receiptCnt.getOrDefault(farmUuid, 0L).intValue();
            Double lastScore = snap.getTotalScore();
            Double newScore = lastScore + delta;
            if (newScore < 0) {
                newScore = 0.0;
            }
            if (newScore > 100) {
                newScore = 100.0;
            }

            result.put(farmUuid, DailyNewScore.toSnapshot(lastScore, delta, newScore));
        }
        executeContext.put("DAILY_DELTA", result);
        return RepeatStatus.FINISHED;
    }
}
