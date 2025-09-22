package com.e105.majoong.report.batch;

import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BatchScheduler {

    private final JobLauncher jobLauncher;
    private final Job monthlyReportJob;

    @Scheduled(cron = "0 0 1 1 * *") // 매월 1일 새벽 1시에 실행
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