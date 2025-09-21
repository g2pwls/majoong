package com.e105.majoong.batch.score.horseState.tasklet;

import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.horseState.HorseStateRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AggregateWeeklyHorseStatusUploadsTasklet implements Tasklet {

    private final HorseStateRepository horseStateRepository;

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


        return null;
    }
}
