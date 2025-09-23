package com.e105.majoong.common.model.farmVault;

import com.e105.majoong.common.model.farmVault.FarmVault;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FarmVaultRepository extends JpaRepository<FarmVault, Long> {
  Optional<FarmVault> findByMemberUuid(String memberUuid);
  Optional<FarmVault> findByKeccakKey(String keccakKey);
  Optional<FarmVault> findByVaultAddress(String vaultAddress);
  Optional<FarmVault> findTopByMemberUuidOrderByIdDesc(String memberUuid);
  Optional<FarmVault> findTopByMemberUuidAndStatusOrderByIdDesc(String memberUuid, FarmVault.Status status);
  Optional<FarmVault> findTopByFarmUuidOrderByIdDesc(String farmUuid);
}
