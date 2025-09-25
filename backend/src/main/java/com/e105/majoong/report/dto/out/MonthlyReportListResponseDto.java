package com.e105.majoong.report.dto.out;

import com.e105.majoong.common.model.monthlyReport.MonthlyReport;
import com.e105.majoong.common.model.myScore.MyScore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class MonthlyReportListResponseDto {
    private Long reportId;
    private int year;
    private int month;
    private String thumbnail;
    private LocalDateTime createdAt;

    public static MonthlyReportListResponseDto toDto(MonthlyReport report) {
        return MonthlyReportListResponseDto.builder()
                .reportId(report.getId())
                .year(report.getCreatedAt().getYear())
                .month(report.getCreatedAt().getMonthValue())
                .thumbnail(report.getThumbnail())
                .createdAt(report.getCreatedAt())
                .build();
    }
}