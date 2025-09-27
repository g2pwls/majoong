package com.e105.majoong.report.dto.out;

import com.e105.majoong.common.model.monthlyReport.MonthlyReport;
import com.e105.majoong.common.model.myScore.MyScore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyReportDetailResponseDto {
    private Long reportId;
    private int year;
    private int month;
    private String content;
    private Double score;
    private String thumbnail;
    private LocalDateTime createdAt;

    public static MonthlyReportDetailResponseDto toDto(MonthlyReport report, MyScore latestScore) {
        return MonthlyReportDetailResponseDto.builder()
                .reportId(report.getId())
                .year(report.getCreatedAt().getYear())
                .month(report.getCreatedAt().getMonthValue())
                .content(report.getContent())
                .score(latestScore.getScore())
                .thumbnail(report.getThumbnail())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
