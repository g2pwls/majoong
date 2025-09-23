package com.e105.majoong.batch.score.receipt.tasklet;

import com.e105.majoong.batch.score.receipt.dto.ReceiptCountDto;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.receiptHistory.ReceiptHistoryCustom;
import java.time.LocalDateTime;
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
public class AggregateDailyReceiptsTasklet implements Tasklet {

    private final ReceiptHistoryCustom receiptHistoryCustom;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        var executeContext = chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext();
        String start = executeContext.getString("WINDOW_START", null);
        String end = executeContext.getString("WINDOW_END", null);
        if (start == null || end == null) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_JOB_PARAMETER);
        }
        LocalDateTime startTime = LocalDateTime.parse(start);
        LocalDateTime endTime = LocalDateTime.parse(end);

        List<ReceiptCountDto> receiptCountDtoList = receiptHistoryCustom.getReceiptCountByOneDay(startTime, endTime);

        Map<String, Long> counts = new LinkedHashMap<>();
        for (ReceiptCountDto receiptCountDto : receiptCountDtoList) {
            counts.put(receiptCountDto.getFarmUuid(), receiptCountDto.getCount());
        }

        executeContext.put("DAILY_RECEIPT_CNT", counts);
        return RepeatStatus.FINISHED;
    }
}
