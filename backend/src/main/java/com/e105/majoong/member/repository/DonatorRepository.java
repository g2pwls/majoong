package com.e105.majoong.member.repository;

import com.e105.majoong.common.domain.Donator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DonatorRepository extends JpaRepository<Donator, Long> {
    Optional<Donator> findByMemberUuid(String memberUuid);
}