package com.e105.majoong.farm.repository;

import com.e105.majoong.common.domain.Farm;
import com.e105.majoong.common.domain.Horse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HorseRepository extends JpaRepository<Horse, Long> {
    List<Horse> findByFarm(Farm farm);
    Page<Horse> findByHorseNameContaining(String horseName, Pageable pageable);
}