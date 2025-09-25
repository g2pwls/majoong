package com.e105.majoong.common.model.receiptHistory;

import com.e105.majoong.batch.score.receipt.dto.ReceiptCountDto;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface ReceiptHistoryCustom {
    List<ReceiptCountDto> getReceiptCountByOneDay(LocalDateTime start, LocalDateTime end);
    Map<String, Integer> sumDonationAmountByFarmUuidsBetween(List<String> farmUuids, LocalDateTime start, LocalDateTime end);
}
