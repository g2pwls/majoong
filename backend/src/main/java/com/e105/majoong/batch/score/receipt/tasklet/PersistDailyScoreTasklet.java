package com.e105.majoong.batch.score.receipt.tasklet;

import com.e105.majoong.batch.score.receipt.snapshot.DailyNewScore;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.common.model.scoreCategory.ScoreCategory;
import com.e105.majoong.common.model.scoreCategory.ScoreCategoryRepository;
import com.e105.majoong.score.dto.in.CreateScoreDto;
import com.e105.majoong.score.service.ScoreService;
import java.time.LocalDate;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PersistDailyScoreTasklet implements Tasklet {

    private final ScoreCategoryRepository scoreCategoryRepository;
    private final ScoreService scoreService;
    private final FarmRepository farmRepository;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        var executeContext = chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext();

        String targetStr = executeContext.getString("TARGET_DATE", null);
        Map<String, DailyNewScore> dailyDelta = (Map<String, DailyNewScore>) executeContext.get("DAILY_DELTA");
        if (targetStr == null || dailyDelta == null) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_JOB_PARAMETER);
        }

        LocalDate targetDate = LocalDate.parse(targetStr);
        int year = targetDate.getYear();
        int month = targetDate.getMonthValue();

        var farmUuids = dailyDelta.keySet();
        Map<String, Farm> farmsByUuid = farmRepository.findAll().stream()
                .filter(farm -> farmUuids.contains(farm.getFarmUuid()))
                .collect(Collectors.toMap(Farm::getFarmUuid, farm -> farm));

        ScoreCategory receiptUpload = scoreCategoryRepository.findByCategory("receipt").orElseThrow(
                () -> new BaseException(BaseResponseStatus.INVALID_SCORE_CATEGORY));

        for (String farmUuid : dailyDelta.keySet()) {
            DailyNewScore dailyNewScore = dailyDelta.get(farmUuid);
            Double newScore = dailyNewScore.getNewScore();
            Farm farm = farmsByUuid.get(farmUuid);
            String memberUuid = farm.getMemberUuid();
            int delta = dailyNewScore.getDelta();
            if (delta != 0) {
                CreateScoreDto dto = CreateScoreDto.toDto(
                        farmUuid, memberUuid, receiptUpload.getId(), newScore, delta, year, month);
                scoreService.createMyScore(dto);
            }
            farm.updateTotalScore(newScore);
        }
        return RepeatStatus.FINISHED;
    }
}
