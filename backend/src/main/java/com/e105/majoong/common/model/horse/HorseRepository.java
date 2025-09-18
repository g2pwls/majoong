package com.e105.majoong.common.model.horse;

import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.horse.Horse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HorseRepository extends JpaRepository<Horse, Long> {
    List<Horse> findByFarm(Farm farm);

    Page<Horse> findByHorseNameContaining(String horseName, Pageable pageable);

    List<Horse> findByFarmId(Long farmId);
}
