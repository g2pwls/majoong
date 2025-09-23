package com.e105.majoong.common.model.farmVault;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter @Builder
@NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "farm_vaults")
@EntityListeners(AuditingEntityListener.class)
public class FarmVault {

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "member_uuid", length = 36, nullable = false)   // ★ farmer와 연결
  private String memberUuid;

  @Column(name = "keccak_key", nullable = false, length = 66)
  private String keccakKey;

  @Column(name = "farm_uuid",length = 36)
  private String farmUuid;

  @Column(name = "vault_address", length = 42, nullable = false)
  private String vaultAddress;

  @Column(name = "deploy_tx_hash", length = 66)
  private String deployTxHash;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private Status status;

  @CreatedDate
  @Column(updatable = false)
  private LocalDateTime createdAt;

  public enum Status { ACTIVE, CLOSED }

  public void updateKeccakKey(String keccakKey) { this.keccakKey = keccakKey; }
  public void updateStatus(Status status) { this.status = status; }
  public void updateDeployTxHash(String txHash) { this.deployTxHash = txHash;}
  public void updateVaultAddress(String address) { this.vaultAddress = address;}
}
