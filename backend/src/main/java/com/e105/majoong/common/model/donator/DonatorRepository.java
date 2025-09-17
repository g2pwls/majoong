package com.e105.majoong.common.model.donator;

import com.e105.majoong.common.model.donator.Donator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DonatorRepository extends JpaRepository<Donator, Long> {
    Optional<Donator> findByMemberUuid(String memberUuid);
}