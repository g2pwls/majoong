package com.e105.majoong.batch.score.horseState.config;

import com.e105.majoong.batch.score.horseState.tasklet.AggregateWeeklyHorseStatusUploadsTasklet;
import com.e105.majoong.batch.score.horseState.tasklet.CalculateWeeklyPenaltyAndBonusTasklet;
import com.e105.majoong.batch.score.horseState.tasklet.FetchWeeklyTargetsSnapshotTasklet;
import com.e105.majoong.batch.score.horseState.tasklet.PersistScoreTasklet;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class WeeklyHorseStatusJobConfig {

    private final FetchWeeklyTargetsSnapshotTasklet fetchWeeklyTargetsSnapshotTasklet;
    private final AggregateWeeklyHorseStatusUploadsTasklet aggregateWeeklyHorseStatusUploadsTasklet;
    private final CalculateWeeklyPenaltyAndBonusTasklet calculateWeeklyPenaltyAndBonusTasklet;
    private final PersistScoreTasklet persistScoreTasklet;


}
