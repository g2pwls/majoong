package com.e105.majoong.farm.dto.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class LastMonthUsageDetailDto {
    private String category;
    private int count;
    private long totalAmount;
}
