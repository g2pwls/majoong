package com.e105.majoong.donation.repository;

import com.e105.majoong.common.domain.Farm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FarmRepository extends JpaRepository<Farm, Long> {
  Optional<Farm> findByMemberUuid(String memberUuid);
}
