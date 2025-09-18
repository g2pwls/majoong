package com.e105.majoong.farm.dto.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class LastMonthUsageResponseDto {
    private long totalAmount;
    private int totalCount;
    private List<LastMonthUsageDetailDto> detailList;

    public static LastMonthUsageResponseDto toDto(
            long totalAmount, int totalCount, List<LastMonthUsageDetailDto> detailList) {
        return LastMonthUsageResponseDto.builder()
                .totalAmount(totalAmount)
                .totalCount(totalCount)
                .detailList(detailList)
                .build();
    }
}
