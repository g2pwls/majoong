package com.e105.majoong.common.model.receiptHistory;

import com.e105.majoong.common.model.receiptHistory.ReceiptHistory;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptHistoryRepository extends JpaRepository<ReceiptHistory, Long> {

    @Query("SELECT YEAR(r.createdAt) as year, MONTH(r.createdAt) as month, SUM(r.totalAmount) as amountSpent " +
            "FROM ReceiptHistory r " +
            "WHERE r.farmUuid = :farmUuid " +
            "GROUP BY YEAR(r.createdAt), MONTH(r.createdAt)")
    List<Object[]> findMonthlyDonationUsed(@Param("farmUuid") String farmUuid);

    List<ReceiptHistory> findByFarmUuidAndCreatedAtBetween(String farmUuid, LocalDateTime start, LocalDateTime end);

    @Query("""
        SELECT rh.categoryId, COUNT(rh.id), SUM(rh.totalAmount)
        FROM ReceiptHistory rh
        WHERE rh.farmUuid = :farmUuid
          AND rh.createdAt BETWEEN :start AND :end
        GROUP BY rh.categoryId
    """)
    List<Object[]> findCategoryStatsLastMonth(
            @Param("farmUuid") String farmUuid,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("""
    SELECT COUNT(rh.id), SUM(rh.totalAmount)
    FROM ReceiptHistory rh
    WHERE rh.farmUuid = :farmUuid
      AND rh.createdAt BETWEEN :start AND :end
""")
    Object findTotalStatsLastMonth(
            @Param("farmUuid") String farmUuid,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);


    Optional<ReceiptHistory> findByIdAndFarmUuid(Long id, String farmUuid);
    boolean existsByApprovalNumber(String approvalNumber);
    Optional<ReceiptHistory> findByApprovalNumber(String approvalNumber);
}
