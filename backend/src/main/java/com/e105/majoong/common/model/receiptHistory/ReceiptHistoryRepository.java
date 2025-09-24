package com.e105.majoong.common.model.receiptHistory;

import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptHistoryRepository extends JpaRepository<ReceiptHistory, Long> {
    List<ReceiptHistory> findByFarmUuidAndCreatedAtBetween(String farmUuid, LocalDateTime start, LocalDateTime end);

    Optional<ReceiptHistory> findByIdAndFarmUuid(Long id, String farmUuid);
}
