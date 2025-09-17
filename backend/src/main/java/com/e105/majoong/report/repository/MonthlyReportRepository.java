package com.e105.majoong.report.repository;

import com.e105.majoong.common.domain.MonthlyReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MonthlyReportRepository extends JpaRepository<MonthlyReport, Long> {
    Optional<MonthlyReport> findByIdAndFarmUuid(Long id, String farmUuid);
    List<MonthlyReport> findByFarmUuidAndCreatedAtBetween(String farmUuid, LocalDateTime createdAtAfter, LocalDateTime createdAtBefore);
}