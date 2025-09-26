package com.e105.majoong.common.model.farmer;

import com.e105.majoong.common.model.farmer.Farmer;
import io.lettuce.core.dynamic.annotation.Param;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    Optional<Farmer> findByMemberUuid(String memberUuid);

    boolean existsByMemberUuid(String memberUuid);

    List<Farmer> findByMemberUuidIn(Collection<String> memberUuids);

    @Query("SELECT f.email FROM Farmer f WHERE f.memberUuid = :memberUuid")
    Optional<String> findEmailByMemberUuid(@Param("memberUuid") String memberUuid);

    @Query("select f.walletAddress from Farmer f where f.memberUuid = :memberUuid")
    Optional<String> findWalletAddressByMemberUuid(String memberUuid);
}