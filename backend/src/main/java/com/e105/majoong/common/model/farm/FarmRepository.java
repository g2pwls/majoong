package com.e105.majoong.common.model.farm;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FarmRepository extends JpaRepository<Farm, Long> {
    Optional<Farm> findByMemberUuid(String memberUuid);

    boolean existsByMemberUuid(String memberUuid);

    Optional<Farm> findByFarmUuid(String farmUuid);

    Page<Farm> findByFarmNameContaining(String farmName, Pageable pageable);

    boolean existsByFarmUuid(String farmUuid);

    Optional<Farm> findTopByMemberUuidOrderByIdDesc(String memberUuid);

    @Modifying
    @Query("""
            update Farm f
            set f.horseCount = f.horseCount + 1
            where f.farmUuid = :farmUuid
            """)
    void incrementHorseCount(@Param("farmUuid") String farmUuid);

    @Modifying(flushAutomatically = true, clearAutomatically = false)
    @Query("""
            update Farm f
               set f.horseCount = case when f.horseCount > 0 then f.horseCount - 1 else 0 end
             where f.farmUuid = :farmUuid
            """)
    void decrementHorseCount(@Param("farmUuid") String farmUuid);
}
