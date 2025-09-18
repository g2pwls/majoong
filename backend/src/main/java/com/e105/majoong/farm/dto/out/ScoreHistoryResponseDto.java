package com.e105.majoong.farm.dto.out;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreHistoryResponseDto {
    private String sourceId;
    private LocalDateTime createdAt;
    private String category;
    private Integer score;
    private Integer year;
    private Integer month;

    @JsonProperty("sourceId")
    public String getSourceId() {
        return "USE-" + createdAt.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + sourceId;
    }
}
