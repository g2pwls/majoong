package com.e105.majoong.common.model.receiptHistory;

import com.e105.majoong.batch.score.receipt.dto.ReceiptCountDto;
import java.time.LocalDateTime;
import java.util.List;

public interface ReceiptHistoryCustom {
    List<ReceiptCountDto> getReceiptCountByOneDay(LocalDateTime start, LocalDateTime end);

    List<Object[]> findMonthlyDonationUsed(String farmUuid);

    List<Object[]> findCategoryStatsLastMonth(String farmUuid, LocalDateTime start, LocalDateTime end);

    Object findTotalStatsLastMonth(String farmUuid, LocalDateTime start, LocalDateTime end);
}
