package com.e105.majoong.batch.score.receipt.config;

import com.e105.majoong.batch.score.receipt.tasklet.AggregateDailyReceiptsTasklet;
import com.e105.majoong.batch.score.receipt.tasklet.CalculateDailyDeltaTasklet;
import com.e105.majoong.batch.score.receipt.tasklet.FetchDailyTargetsSnapshotTasklet;
import com.e105.majoong.batch.score.receipt.tasklet.PersistDailyScoreTasklet;
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
public class DailyReceiptJobConfig {
    private final AggregateDailyReceiptsTasklet aggregateDailyReceiptsTasklet;
    private final CalculateDailyDeltaTasklet calculateDailyDeltaTasklet;
    private final FetchDailyTargetsSnapshotTasklet fetchDailyTargetsSnapshotTasklet;
    private final PersistDailyScoreTasklet persistDailyScoreTasklet;
    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;

    @Bean
    public Job dailyReceiptJob() {
        return new JobBuilder("dailyReceiptJob", jobRepository)
                .start(fetchDailySnapshotStep())
                .next(aggregateDailyStatusStep())
                .next(calculateDailyStep())
                .next(persistDailyScoreStep())
                .build();
    }

    @Bean
    public Step fetchDailySnapshotStep() {
        return new StepBuilder("fetchDailySnapshotStep", jobRepository)
                .tasklet(fetchDailyTargetsSnapshotTasklet, transactionManager)
                .build();
    }

    @Bean
    public Step aggregateDailyStatusStep() {
        return new StepBuilder("aggregateDailyStatusStep", jobRepository)
                .tasklet(aggregateDailyReceiptsTasklet, transactionManager)
                .build();
    }

    @Bean
    public Step calculateDailyStep() {
        return new StepBuilder("calculateDailyStep", jobRepository)
                .tasklet(calculateDailyDeltaTasklet, transactionManager)
                .build();
    }

    @Bean
    public Step persistDailyScoreStep() {
        return new StepBuilder("persistDailyScoreStep", jobRepository)
                .tasklet(persistDailyScoreTasklet, transactionManager)
                .build();
    }
}
