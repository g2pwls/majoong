package com.e105.majoong.common.model.settlementHistory;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "settlement_history",
    indexes = {
        @Index(name = "idx_settlement_farm_uuid", columnList = "farm_uuid")
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

  @Column(name = "evidence_id", length = 36, unique = true, nullable = false)
  private String evidenceId;

  @Column(name = "farm_uuid", length = 12, nullable = false)
  private String farmUuid;

  @Column(name = "farmer_wallet", nullable = false)
  private String farmerWallet;

  @Column(name = "vault_address", nullable = false)
  private String vaultAddress;

  // 토큰 "표시용" 문자열 (예: "12")
  @Column(name = "released_amount", nullable = false)
  private String releasedAmount;

  @Column(name = "tx_hash")
  private String txHash;

  // PENDING / RELEASED / FAILED
  @Column(name = "status", nullable = false)
  private String status;

  @Column(name = "fail_reason")
  private String failReason;

  private Long balance;

  private Long withdrawAmount; //won

  private Long withdrawToken; //token

  /** DTO 의존 제거: 필요한 값만 받아서 엔티티 생성 */
  public static SettlementHistory toEntity(
      String farmUuid,
      String evidenceId,
      String farmerWallet,
      String vaultAddress,
      String releasedAmount,
      String status,
      String txHash,
      String failReason,
      Long balance,
      Long withdrawAmount,
      Long withdrawToken
  ) {
    return SettlementHistory.builder()
        .evidenceId(evidenceId)
        .farmUuid(farmUuid)
        .farmerWallet(farmerWallet)
        .vaultAddress(vaultAddress)
        .releasedAmount(releasedAmount)
        .txHash(txHash)
        .status(status)
        .failReason(failReason)
        .balance(balance)
        .withdrawAmount(withdrawAmount)
        .withdrawToken(withdrawToken)
        .build();
  }

  /** 성공 케이스 편의 생성자 */
  public static SettlementHistory released(
      String farmUuid,
      String evidenceId,
      String farmerWallet,
      String vaultAddress,
      String releasedAmount,
      String txHash,
      Long balance,
      Long withdrawAmount,
      Long withdrawToken
  ) {
    return toEntity(farmUuid, evidenceId, farmerWallet,
            vaultAddress, releasedAmount, "RELEASED",
            txHash, null, balance, withdrawAmount, withdrawToken);
  }

  /** 실패 케이스 편의 생성자 */
  public static SettlementHistory failed(
      String farmUuid,
      String evidenceId,
      String farmerWallet,
      String vaultAddress,
      String releasedAmount,
      String failReason,
      Long balance,
      Long withdrawAmount,
      Long withdrawToken
  ) {
    return toEntity(farmUuid, evidenceId, farmerWallet,
            vaultAddress, releasedAmount, "FAILED",
            null, failReason, balance, withdrawAmount, withdrawToken);
  }
}
