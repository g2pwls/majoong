package com.e105.majoong.mamageFarm.repository;

import com.e105.majoong.common.domain.Farm;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {
    Optional<Farm> findByFarmUuid(String farmUuid);
}
