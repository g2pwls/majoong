package com.e105.majoong.batch.score;

import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/batch")
public class BatchController {
    private final JobLauncher jobLauncher;
    private final Job weeklyHorseStatusJob;

    @GetMapping("/run")
    public String runJob() throws Exception {
        LocalDate monday = LocalDate.now()
                .with(java.time.DayOfWeek.MONDAY);
        JobParameters params = new JobParametersBuilder()
                .addString("weekRefDate", monday.toString())
                .addLong("time", System.currentTimeMillis()) // 유니크 보장
                .toJobParameters();
        jobLauncher.run(weeklyHorseStatusJob, params);
        return "Batch job started!";
    }
}
