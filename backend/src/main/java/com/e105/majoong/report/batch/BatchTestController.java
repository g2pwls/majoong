package com.e105.majoong.report.batch;

import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/batch")
@RequiredArgsConstructor
public class BatchTestController {

    private final JobLauncher jobLauncher;
    private final Job monthlyReportJob;

    @PostMapping("/run-monthly-report")
    public String runMonthlyReportJob() {
        try {
            JobParameters jobParameters = new JobParametersBuilder()
                    .addString("JobID", String.valueOf(System.currentTimeMillis()))
                    .toJobParameters();
            jobLauncher.run(monthlyReportJob, jobParameters);
            return "Batch job has been invoked";
        } catch (Exception e) {
            e.printStackTrace();
            return "Job failed to run: " + e.getMessage();
        }
    }
}
