package com.e105.majoong.farm.dto.out;

import com.e105.majoong.common.model.horseState.HorseState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HorseWeeklyReportDetailResponseDto {
    private String frontImage;
    private String leftSideImage;
    private String rightSideImage;
    private String stableImage;
    private String aiSummary;
    private String content;
    private LocalDateTime uploadedAt;

    public static HorseWeeklyReportDetailResponseDto toDto(HorseState state) {
        return HorseWeeklyReportDetailResponseDto.builder()
                .frontImage(state.getFrontImage())
                .leftSideImage(state.getLeftSideImage())
                .rightSideImage(state.getRightSideImage())
                .stableImage(state.getStableImage())
                .aiSummary(state.getAiSummary())
                .content(state.getContent())
                .uploadedAt(state.getUploadedAt())
                .build();
    }
}