package com.e105.majoong.farm.repository;

import com.e105.majoong.common.domain.MonthlyReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MonthlyReportRepository extends JpaRepository<MonthlyReport, Long> {
    Optional<MonthlyReport> findByIdAndFarmUuid(Long id, String farmUuid);
}