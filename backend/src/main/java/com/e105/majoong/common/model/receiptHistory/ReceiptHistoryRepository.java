package com.e105.majoong.common.model.receiptHistory;

import com.e105.majoong.common.model.receiptHistory.ReceiptHistory;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReceiptHistoryRepository extends JpaRepository<ReceiptHistory, Long> {

    @Query("SELECT YEAR(r.createdAt) as year, MONTH(r.createdAt) as month, SUM(r.totalAmount) as amountSpent " +
            "FROM ReceiptHistory r " +
            "WHERE r.farmUuid = :farmUuid " +
            "GROUP BY YEAR(r.createdAt), MONTH(r.createdAt)")
    List<Object[]> findMonthlyDonationUsed(@Param("farmUuid") String farmUuid);

    List<ReceiptHistory> findByFarmUuidAndCreatedAtBetween(String farmUuid, LocalDateTime start, LocalDateTime end);
}
