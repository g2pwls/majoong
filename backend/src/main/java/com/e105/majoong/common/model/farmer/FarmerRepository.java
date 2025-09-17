package com.e105.majoong.common.model.farmer;

import com.e105.majoong.common.model.farmer.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    Optional<Farmer> findByMemberUuid(String memberUuid);
}