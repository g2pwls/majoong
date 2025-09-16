package com.e105.majoong.farm.repository;

import com.e105.majoong.common.domain.MyScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MyScoreRepository extends JpaRepository<MyScore, Long> {
    List<MyScore> findByFarmUuid(String farmUuid);
}
