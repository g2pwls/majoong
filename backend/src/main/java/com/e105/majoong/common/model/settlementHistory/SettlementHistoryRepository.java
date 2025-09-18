package com.e105.majoong.common.model.settlementHistory;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SettlementHistoryRepository extends JpaRepository<SettlementHistory, Long> {
  boolean existsByEvidenceId(String evidenceId);
}
