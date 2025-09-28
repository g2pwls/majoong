package com.e105.majoong.common.model.receiptHistory;

import com.e105.majoong.batch.score.receipt.dto.ReceiptCountDto;
import com.e105.majoong.farm.dto.out.CategoryStatsDto;
import com.e105.majoong.farm.dto.out.MonthlyDonationUsedDto;
import com.e105.majoong.farm.dto.out.TotalStatsDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface ReceiptHistoryCustom {
    List<ReceiptCountDto> getReceiptCountByOneDay(LocalDateTime start, LocalDateTime end);
    
    Map<String, Long> sumDonationAmountByFarmUuidsBetween(List<String> farmUuids, LocalDateTime start, LocalDateTime end);

    List<MonthlyDonationUsedDto> findMonthlyDonationUsed(String farmUuid);

    List<CategoryStatsDto> findCategoryStatsLastMonth(String farmUuid, LocalDateTime start, LocalDateTime end);

    TotalStatsDto findTotalStatsLastMonth(String farmUuid, LocalDateTime start, LocalDateTime end);
}
