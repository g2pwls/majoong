package com.e105.majoong.report.dto.out;

import com.e105.majoong.common.model.monthlyReport.MonthlyReport;
import com.e105.majoong.common.model.myScore.MyScore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class MonthlyReportListResponseDto {
    private Long reportId;
    private int year;
    private int month;
    private String thumbnail;

    public static MonthlyReportListResponseDto toDto(MonthlyReport report) {
        return MonthlyReportListResponseDto.builder()
                .reportId(report.getId())
                .year(report.getCreatedAt().getYear())
                .month(report.getCreatedAt().getMonthValue())
                .thumbnail(report.getThumbnail())
                .build();
    }
}