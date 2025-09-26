package com.e105.majoong.batch.score.scheduler;

import java.time.LocalDate;
import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "jobs.scheduling", name = "enabled", havingValue = "true")
public class ScoreScheduler {
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private final JobLauncher jobLauncher;
    @Qualifier(value = "weeklyHorseStatusJob")
    private final Job weeklyHorseStatusJob;
    @Qualifier(value = "dailyReceiptJob")
    private final Job dailyReceiptJob;


    @Scheduled(cron = "0 10 0 * * MON", zone = "Asia/Seoul")
    public void runWeeklyJob() {
        JobParameters params = new JobParametersBuilder()
                .addString("weekRefDate", LocalDate.now(KST).toString())
                .toJobParameters();

        try {
            jobLauncher.run(weeklyHorseStatusJob, params);
        } catch (Exception e) {
            log.error("[WeeklyJob] Failed", e);
        }
    }

    @Scheduled(cron = "0 5 0 * * *", zone = "Asia/Seoul")
    public void runDailyJob() {
        LocalDate target = LocalDate.now(KST).minusDays(1);
        JobParameters params = new JobParametersBuilder()
                .addString("targetDate", target.toString())
                .toJobParameters();

        try {
            jobLauncher.run(dailyReceiptJob, params);
        } catch (Exception e) {
            log.error("[DailyJob] Failed", e);
        }
    }
}
