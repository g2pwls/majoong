package com.e105.majoong.farm.dto.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyDonationUsedDto {
    private int year;
    private int month;
    private Long amountSpent;
}
