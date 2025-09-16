package com.e105.majoong.farm.dto.out;

import com.e105.majoong.common.domain.MonthlyReport;
import com.e105.majoong.common.domain.MyScore;
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
    private double score;
    private String thumbnail;

    public static MonthlyReportListResponseDto toDto(MonthlyReport report, MyScore scoreEntity) {
        return MonthlyReportListResponseDto.builder()
                .reportId(report.getId())
                .year(scoreEntity.getYear())
                .month(scoreEntity.getMonth())
                .score(scoreEntity.getScore())
                .thumbnail(report.getThumbnail())
                .build();
    }
}