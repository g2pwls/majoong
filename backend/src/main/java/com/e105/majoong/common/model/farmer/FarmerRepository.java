package com.e105.majoong.common.model.farmer;

import com.e105.majoong.common.model.farmer.Farmer;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    Optional<Farmer> findByMemberUuid(String memberUuid);

    @Query("SELECT f.email FROM Farmer f WHERE f.memberUuid = :memberUuid")
    Optional<String> findEmailByMemberUuid(@Param("memberUuid") String memberUuid);
}