package com.e105.majoong.farm.dto.out;


import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class DonationUsageResponseDto {
    private List<MonthlyDonationUsedDto> monthlyDonationUsed;
    private List<ReceiptHistoryResponseDto> receiptHistory;
}
