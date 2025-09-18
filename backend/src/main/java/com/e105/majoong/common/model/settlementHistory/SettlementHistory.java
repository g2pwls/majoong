package com.e105.majoong.common.model.settlementHistory;

import com.e105.majoong.settlement.dto.in.ReceiptEvidenceRequest;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "settlement_history",
    indexes = {
        @Index(name = "idx_settlement_farm_uuid", columnList = "farmUuid")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SettlementHistory {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // 증빙 ID는 유니크 제약만 필드에 직접 지정
  @Column(length = 36, unique = true, nullable = false)
  private String evidenceId;

  // farmUuid는 조회가 자주 일어나므로 인덱스를 잡아주는 게 좋음
  @Column(length = 12, nullable = false)
  private String farmUuid;

  @Column(nullable = false)
  private String farmerWallet;

  @Column(nullable = false)
  private String vaultAddress;

  @Column(nullable = false)
  private String releasedAmount; // 문자열(18 decimals 고려)

  private String txHash;

  @Column(nullable = false)
  private String status; // PENDING/RELEASED/FAILED

  private String failReason;

  private LocalDateTime createdAt;

  private LocalDateTime updatedAt;

  public static SettlementHistory toEntity(
      String farmUuid,
      String farmerWallet,
      String vaultAddress,
      ReceiptEvidenceRequest req,
      String releasedAmount,
      String status,
      String txHash,
      String failReason
  ) {
    return SettlementHistory.builder()
        .evidenceId(req.getEvidenceId())
        .farmUuid(farmUuid)
        .farmerWallet(farmerWallet)
        .vaultAddress(vaultAddress)
        .releasedAmount(releasedAmount)
        .txHash(txHash)
        .status(status)
        .failReason(failReason)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
  }

  @PreUpdate
  public void touch() {
    this.updatedAt = LocalDateTime.now();
  }
}
