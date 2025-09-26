package com.e105.majoong.batch.report;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/batch")
@RequiredArgsConstructor
@Slf4j
public class BatchController {

    private final JobLauncher jobLauncher;
    private final Job monthlyReportJob;

    /**
     * 월간 보고서 배치 수동 실행
     */
    @PostMapping("/monthly-report")
    public ResponseEntity<String> runMonthlyReportJob() {
        try {
            JobParameters jobParameters = new JobParametersBuilder()
                    .addString("JobID", String.valueOf(System.currentTimeMillis()))
                    .toJobParameters();

            jobLauncher.run(monthlyReportJob, jobParameters);

            return ResponseEntity.ok("월간 보고서 배치 실행 시작됨 ✅");
        } catch (Exception e) {
            log.error("월간 보고서 배치 실행 실패", e);
            return ResponseEntity.internalServerError()
                    .body("월간 보고서 배치 실행 실패 ❌: " + e.getMessage());
        }
    }
}