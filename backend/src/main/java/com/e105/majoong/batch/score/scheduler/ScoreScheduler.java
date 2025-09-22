package com.e105.majoong.batch.score.scheduler;

import com.e105.majoong.batch.score.horseState.config.WeeklyHorseStatusJobConfig;
import java.time.LocalDate;
import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameter;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScoreScheduler {
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private final JobLauncher jobLauncher;
    private final Job weeklyHorseStatusJob;


    @Scheduled(cron = "0 10 0 * * MON", zone = "Asia/Seoul")
    public void runJob() {
        LocalDate monday = LocalDate.now(KST);
        JobParameters params = new JobParametersBuilder()
                .addString("weekRefDate", monday.toString())
                .toJobParameters();

        try {
            jobLauncher.run(weeklyHorseStatusJob, params);
        } catch (Exception e) {
            log.error("[WeeklyHorseStatus] Failed", e);
        }
    }
}
