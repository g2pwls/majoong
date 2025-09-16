package com.e105.majoong.farm.dto.out;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MonthlyDonationUsedDto {
    private int year;
    private int month;
    private Long amountSpent;

    public static MonthlyDonationUsedDto from(Object[] obj) {
        return new MonthlyDonationUsedDto(
                ((Number) obj[0]).intValue(), //년
                ((Number) obj[1]).intValue(), //월
                ((Number) obj[2]).longValue() //금액
        );
    }
}
