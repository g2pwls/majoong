package com.e105.majoong.batch.score.horseState.tasklet;

import com.e105.majoong.batch.score.horseState.snapshot.WeeklyNewScore;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farm.FarmRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CalculateWeeklyPenaltyAndBonusTasklet implements Tasklet {
    private final FarmRepository farmRepository;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        var executeContext = chunkContext.getStepContext().getStepExecution().getJobExecution().getExecutionContext();

        Map<String, Set<Long>> allByFarm = (Map<String, Set<Long>>) executeContext.get("WEEK_HORSE_SNAPSHOT");
        Map<String, Set<Long>> upByFarm = (Map<String, Set<Long>>) executeContext.get("WEEK_UPLOADED");
        if (allByFarm == null || upByFarm == null) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_JOB_PARAMETER);
        }

        Map<String, Double> farmScore = farmRepository.findAll().stream()
                .collect(Collectors.toMap(
                        Farm::getFarmUuid,
                        farm -> Optional.ofNullable(farm.getTotalScore()).orElse(38.2),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        Map<String, WeeklyNewScore> result = new LinkedHashMap<>();
        for (String farmUuid : allByFarm.keySet()) {
            Set<Long> allHorses = allByFarm.getOrDefault(farmUuid, Set.of());
            Set<Long> uploadedHorses = upByFarm.getOrDefault(farmUuid, Set.of());

            List<Long> notUploaded = allHorses.stream()
                    .filter(horse -> !uploadedHorses.contains(horse))
                    .sorted()
                    .collect(Collectors.toList());

            int delta;
            if (notUploaded.isEmpty() && !allHorses.isEmpty()) { //농장에 말이 있고 전부 업로드 했을 경우
                delta = 5;
            } else {
                delta = -notUploaded.size();
            }

            Double lastScore = farmScore.get(farmUuid);
            Double newScore = lastScore + delta;
            if (newScore < 0) {
                newScore = 0.0;
            }
            if (newScore > 100) {
                newScore = 100.0;
            }
            WeeklyNewScore weeklyNewScore = WeeklyNewScore.toSnapshot(
                    lastScore, delta, newScore, new ArrayList<>(notUploaded));

            result.put(farmUuid, weeklyNewScore);
        }
        executeContext.put("WEEKLY_DELTA", result);
        return RepeatStatus.FINISHED;
    }

}
