package com.e105.majoong.farmvault.repository;

import com.e105.majoong.farmvault.entity.FarmVault;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FarmVaultRepository extends JpaRepository<FarmVault, Long> {
  Optional<FarmVault> findByMemberUuid(String memberUuid);
  Optional<FarmVault> findByFarmId(String farmId);
  Optional<FarmVault> findByVaultAddress(String vaultAddress);
}
