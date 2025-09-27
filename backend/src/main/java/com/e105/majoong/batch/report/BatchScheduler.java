package com.e105.majoong.batch.report;

import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "jobs.scheduling", name = "enabled", havingValue = "true")
public class BatchScheduler {

    private final JobLauncher jobLauncher;
    private final Job monthlyReportJob;

    @Scheduled(cron = "0 0 11 31 * *") // 매월 31일 오전 11시에 실행
    public void runMonthlyReportJob() {
        try {
            JobParameters jobParameters = new JobParametersBuilder()
                    .addString("JobID", String.valueOf(System.currentTimeMillis()))
                    .toJobParameters();
            jobLauncher.run(monthlyReportJob, jobParameters);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}