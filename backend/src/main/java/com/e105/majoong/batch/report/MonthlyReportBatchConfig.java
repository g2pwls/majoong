package com.e105.majoong.batch.report;

import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.monthlyReport.MonthlyReport;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.database.JpaItemWriter;
import org.springframework.batch.item.database.JpaPagingItemReader;
import org.springframework.batch.item.database.builder.JpaPagingItemReaderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@RequiredArgsConstructor
public class MonthlyReportBatchConfig {

    private final EntityManagerFactory entityManagerFactory;
    private final MonthlyReportProcessor monthlyReportProcessor;

    @Bean
    public Job monthlyReportJob(JobRepository jobRepository, Step monthlyReportStep) {
        return new JobBuilder("monthlyReportJob", jobRepository)
                .start(monthlyReportStep)
                .build();
    }

    @Bean
    public Step monthlyReportStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);   // 동시에 처리할 최소 스레드
        executor.setMaxPoolSize(8);    // 최대 스레드 (상황에 따라 확장)
        executor.setQueueCapacity(20); // 대기열 크기
        executor.setThreadNamePrefix("monthly-report-");
        executor.initialize();

        return new StepBuilder("monthlyReportStep", jobRepository)
                .<Farm, MonthlyReport>chunk(10, transactionManager)
                .reader(farmReader())
                .processor(monthlyReportProcessor)
                .writer(monthlyReportWriter())
                .taskExecutor(executor)
                .build();
    }


    @Bean
    public JpaPagingItemReader<Farm> farmReader() {
        return new JpaPagingItemReaderBuilder<Farm>()
                .name("farmReader")
                .entityManagerFactory(entityManagerFactory)
                .pageSize(10)
                .queryString("SELECT f FROM Farm f")
                .build();
    }

    @Bean
    public JpaItemWriter<MonthlyReport> monthlyReportWriter() {
        JpaItemWriter<MonthlyReport> jpaItemWriter = new JpaItemWriter<>();
        jpaItemWriter.setEntityManagerFactory(entityManagerFactory);
        return jpaItemWriter;
    }
}