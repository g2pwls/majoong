package com.e105.majoong.farm.repository;

import com.e105.majoong.common.domain.Farm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmRepository extends JpaRepository<Farm, Long> {
    Page<Farm> findByFarmNameContaining(String farmName, Pageable pageable);
}
