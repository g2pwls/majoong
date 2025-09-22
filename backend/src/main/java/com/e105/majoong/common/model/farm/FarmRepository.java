package com.e105.majoong.common.model.farm;

import com.e105.majoong.common.model.farm.Farm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FarmRepository extends JpaRepository<Farm, Long> {
    Optional<Farm> findByMemberUuid(String memberUuid);

    Optional<Farm> findByFarmUuid(String farmUuid);

    Page<Farm> findByFarmNameContaining(String farmName, Pageable pageable);

    boolean existsByFarmUuid(String farmUuid);

    Optional<Farm> findTopByMemberUuidOrderByIdDesc(String memberUuid);
}
