package com.e105.majoong.common.model.settlementHistory;

import com.e105.majoong.common.entity.BaseEntity;
import com.e105.majoong.settlement.dto.in.ReceiptEvidenceRequest;
import jakarta.persistence.*;
import lombok.*;

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
public class SettlementHistory extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(length = 36, unique = true, nullable = false)
  private String evidenceId;

  @Column(length = 12, nullable = false)
  private String farmUuid;

  @Column(nullable = false)
  private String farmerWallet;

  @Column(nullable = false)
  private String vaultAddress;

  @Column(nullable = false)
  private String releasedAmount; // 표시용(정수 토큰 문자열 등)

  private String txHash;

  @Column(nullable = false)
  private String status; // PENDING/RELEASED/FAILED

  private String failReason;

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
        .build();
  }
}
