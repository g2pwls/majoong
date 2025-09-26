package com.e105.majoong.common.model.horseState;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HorseStateRepository extends JpaRepository<HorseState, Long>, HorseStateRepositoryCustom {
    Optional<HorseState> findByIdAndHorseNumber(Long id, String horseNumber);
}
