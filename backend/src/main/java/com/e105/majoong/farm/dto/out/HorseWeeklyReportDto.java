package com.e105.majoong.farm.dto.out;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class HorseWeeklyReportDto {
    private Long horseReportId;
    private String frontImageUrl;
    private int month;
    private int week;
    private String aiSummary;
    private LocalDateTime uploadedAt;
}