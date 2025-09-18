package com.e105.majoong.common.model.donator;

import com.e105.majoong.common.model.donator.Donator;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DonatorRepository extends JpaRepository<Donator, Long> {
    Optional<Donator> findByMemberUuid(String memberUuid);

    boolean existsByMemberUuid(String memberUuid);

    @Query("SELECT d.email FROM Donator d WHERE d.memberUuid = :memberUuid")
    Optional<String> findEmailByMemberUuid(@Param("memberUuid") String memberUuid);
}