package com.e105.majoong.common.model.myScore;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MyScoreRepository extends JpaRepository<MyScore, Long> {
    List<MyScore> findByFarmUuid(String farmUuid);
    Optional<MyScore> findFirstByFarmUuidOrderByYearDescMonthDesc(String farmUuid);
    Optional<MyScore> findByFarmUuidAndYearAndMonth(String farmUuid, Integer year, Integer month);
}

