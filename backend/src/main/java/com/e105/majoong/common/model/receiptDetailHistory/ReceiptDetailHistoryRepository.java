package com.e105.majoong.common.model.receiptDetailHistory;

import com.e105.majoong.common.model.receiptHistory.ReceiptHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReceiptDetailHistoryRepository extends JpaRepository<ReceiptDetailHistory, Long> {
    List<ReceiptDetailHistory> findByReceiptHistory(ReceiptHistory receiptHistory);
}