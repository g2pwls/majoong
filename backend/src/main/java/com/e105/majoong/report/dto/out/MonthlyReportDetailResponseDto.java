package com.e105.majoong.report.dto.out;

import com.e105.majoong.common.domain.MonthlyReport;
import com.e105.majoong.common.domain.MyScore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyReportDetailResponseDto {
    private Long reportId;
    private int year;
    private int month;
    private String content;
    private int score;

    public static MonthlyReportDetailResponseDto toDto(MonthlyReport report, MyScore latestScore) {
        return MonthlyReportDetailResponseDto.builder()
                .reportId(report.getId())
                .year(latestScore.getYear())
                .month(latestScore.getMonth())
                .content(report.getContent())
                .score(latestScore.getScore())
                .build();
    }
}
