package com.e105.majoong.mamageFarm.repository;

import com.e105.majoong.common.domain.Farm;
import com.e105.majoong.common.domain.Horse;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HorseRepository extends JpaRepository<Horse, Long> {
    List<Horse> findByFarm(Farm farm);
}
