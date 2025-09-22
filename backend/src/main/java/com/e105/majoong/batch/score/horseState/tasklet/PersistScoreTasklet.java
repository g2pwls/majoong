package com.e105.majoong.batch.score.horseState.tasklet;

import com.e105.majoong.batch.score.horseState.snapshot.WeeklyNewScore;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.common.model.myScore.MyScoreRepository;
import com.e105.majoong.common.model.scoreCategory.ScoreCategory;
import com.e105.majoong.common.model.scoreCategory.ScoreCategoryRepository;
import com.e105.majoong.score.dto.in.CreateScoreDto;
import com.e105.majoong.score.service.ScoreService;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class PersistScoreTasklet implements Tasklet {

    private final FarmRepository farmRepository;
    private final ScoreCategoryRepository scoreCategoryRepository;
    private final ScoreService scoreService;

    @Override
    @Transactional
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        var executeContext = chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext();

        String label = executeContext.getString("WEEK_LABEL", null);
        String end = executeContext.getString("WEEK_END", null);
        if (label == null || end == null) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_JOB_PARAMETER);
        }

        LocalDateTime weekEnd = LocalDateTime.parse(end);
        int year = weekEnd.getYear();
        int month = weekEnd.getMonthValue();

        Map<String, WeeklyNewScore> upload = (Map<String, WeeklyNewScore>) executeContext.get("WEEKLY_DELTA");
        if (upload == null) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_JOB_PARAMETER);
        }

        ScoreCategory horseUpload = scoreCategoryRepository.findByCategory("horse_photo").orElseThrow(
                () -> new BaseException(BaseResponseStatus.INVALID_SCORE_CATEGORY));

        var farmUuids = upload.keySet();
        Map<String, Farm> farmsByUuid = farmRepository.findAll().stream()
                .filter(farm -> farmUuids.contains(farm.getFarmUuid()))
                .collect(Collectors.toMap(Farm::getFarmUuid, farm -> farm));

        for (String farmUuid : upload.keySet()) {
            WeeklyNewScore weeklyNewScore = upload.get(farmUuid);
            Double newScore = weeklyNewScore.getNewScore();
            Farm farm = farmsByUuid.get(farmUuid);
            String memberUuid = farm.getMemberUuid();
            int delta = weeklyNewScore.getDelta();
            if (delta != 0) {
                CreateScoreDto dto = CreateScoreDto.toDto(
                        farmUuid, memberUuid, horseUpload.getId(), delta, year, month);
                scoreService.createMyScore(dto);
            }
            farm.updateTotalScore(newScore);
        }
        return RepeatStatus.FINISHED;
    }
}
