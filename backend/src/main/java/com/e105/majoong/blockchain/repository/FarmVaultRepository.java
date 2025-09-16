package com.e105.majoong.blockchain.repository;

import com.e105.majoong.common.domain.FarmVault;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FarmVaultRepository extends JpaRepository<FarmVault, Long> {
  Optional<FarmVault> findByMemberUuid(String memberUuid);
  Optional<FarmVault> findByFarmId(String farmId);
  Optional<FarmVault> findByVaultAddress(String vaultAddress);
}
