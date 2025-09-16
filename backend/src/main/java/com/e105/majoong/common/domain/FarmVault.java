package com.e105.majoong.common.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "farm_vaults")
public class FarmVault {

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "member_uuid", length = 36, nullable = false)   // ★ farmer와 연결
  private String memberUuid;

  // 온체인 farmId (컨트랙트 createVault의 파라미터)
  @Column(name = "farm_id", nullable = false, length = 66)
  private String farmId;

  @Column(name = "vault_address", length = 42, nullable = false)
  private String vaultAddress;

  @Column(name = "deploy_tx_hash", length = 66)
  private String deployTxHash;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private Status status;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  public enum Status { ACTIVE, CLOSED }
}
