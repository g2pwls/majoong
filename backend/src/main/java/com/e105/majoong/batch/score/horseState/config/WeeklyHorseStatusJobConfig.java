package com.e105.majoong.batch.score.horseState.config;

import com.e105.majoong.batch.score.horseState.tasklet.AggregateWeeklyHorseStatusUploadsTasklet;
import com.e105.majoong.batch.score.horseState.tasklet.CalculateWeeklyPenaltyAndBonusTasklet;
import com.e105.majoong.batch.score.horseState.tasklet.FetchWeeklyTargetsSnapshotTasklet;
import com.e105.majoong.batch.score.horseState.tasklet.PersistWeeklyScoreTasklet;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@EnableBatchProcessing
@RequiredArgsConstructor
public class WeeklyHorseStatusJobConfig {

    private final FetchWeeklyTargetsSnapshotTasklet fetchWeeklyTargetsSnapshotTasklet;
    private final AggregateWeeklyHorseStatusUploadsTasklet aggregateWeeklyHorseStatusUploadsTasklet;
    private final CalculateWeeklyPenaltyAndBonusTasklet calculateWeeklyPenaltyAndBonusTasklet;
    private final PersistWeeklyScoreTasklet persistWeeklyScoreTasklet;
    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;

    @Bean
    public Job weeklyHorseStatusJob() {
        return new JobBuilder("weeklyHorseStatusJob", jobRepository)
                .start(fetchSnapshotStep())
                .next(aggregateStatusStep())
                .next(calculatePenaltyStep())
                .next(persistScoreStep())
                .build();
    }

    @Bean
    public Step fetchSnapshotStep() {
        return new StepBuilder("fetchSnapshotStep", jobRepository)
                .tasklet(fetchWeeklyTargetsSnapshotTasklet, transactionManager)
                .build();
    }

    @Bean
    public Step aggregateStatusStep() {
        return new StepBuilder("aggregateStatusStep", jobRepository)
                .tasklet(aggregateWeeklyHorseStatusUploadsTasklet, transactionManager)
                .build();
    }

    @Bean
    public Step calculatePenaltyStep() {
        return new StepBuilder("calculatePenaltyStep", jobRepository)
                .tasklet(calculateWeeklyPenaltyAndBonusTasklet, transactionManager)
                .build();
    }

    @Bean
    public Step persistScoreStep() {
        return new StepBuilder("persistScoreStep", jobRepository)
                .tasklet(persistWeeklyScoreTasklet, transactionManager)
                .build();
    }

}
