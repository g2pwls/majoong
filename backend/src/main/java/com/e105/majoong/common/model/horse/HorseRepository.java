package com.e105.majoong.common.model.horse;

import com.e105.majoong.common.model.farm.Farm;
import java.util.List;
import java.util.Optional;
import javax.swing.text.html.Option;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HorseRepository extends JpaRepository<Horse, Long> {
    List<Horse> findByFarm(Farm farm);

    Page<Horse> findByHorseNameContaining(String horseName, Pageable pageable);

    List<Horse> findByFarmId(Long farmId);

    Optional<Horse> findByHorseNumberAndFarm_FarmUuid(Long horseNumber, String farmUuid);

    Optional<Horse> findByHorseNumber(Long horseNumber);

    boolean existsByHorseNumber(Long horseNumber);
}
