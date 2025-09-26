package com.e105.majoong.common.model.horse;

import com.e105.majoong.common.model.farm.Farm;
import java.util.List;
import java.util.Optional;
import javax.swing.text.html.Option;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface HorseRepository extends JpaRepository<Horse, Long> {
    List<Horse> findByFarm(Farm farm);

    Page<Horse> findByHorseNameContainingAndDeletedAtIsNull(String horseName, Pageable pageable);

    List<Horse> findByFarmIdAndDeletedAtIsNull(Long farmId);

    Optional<Horse> findByHorseNumberAndFarm_FarmUuid(String horseNumber, String farmUuid);

    Optional<Horse> findByHorseNumber(String horseNumber);

    boolean existsByHorseNumberAndDeletedAtIsNull(String horseNumber);

    List<Horse> findByFarmAndDeletedAtIsNull(Farm farm);

    Optional<Horse> findByHorseNumberAndDeletedAtIsNull(String horseNumber);

    Page<Horse> findByDeletedAtIsNull(Pageable pageable);

}
