package com.e105.majoong.receipt.dto.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettlementWithdrawBurnResponseDto {

  /** 1. 정산 결과 */
  private SettlementResult settlement;

  /** 2. 출금 결과 */
  private WithdrawResponseDto withdraw;

  /** 3. 온체인 소각 결과 */
  private BurnResult burn;

  // ---------- inner ----------

  @Getter
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class SettlementResult {
    private boolean released;       // 정산 성공 여부
    private String reason;          // 실패 시 사유, 성공 시 "OK"
    private String farmerWallet;
    private String vaultAddress;
    private String releasedAmount;  // KRW
  }

  @Getter
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class BurnResult {
    private String burnTxHash;
    private boolean burnSucceeded;
  }

  // ---------- factory methods ----------

  public static SettlementWithdrawBurnResponseDto ok(
      boolean released, String reason,
      String farmerWallet, String vaultAddress, String releasedAmount,
      WithdrawResponseDto withdraw,
      String burnTxHash, boolean burnSucceeded
  ) {
    return SettlementWithdrawBurnResponseDto.builder()
        .settlement(SettlementResult.builder()
            .released(released)
            .reason(reason)
            .farmerWallet(farmerWallet)
            .vaultAddress(vaultAddress)
            .releasedAmount(releasedAmount)
            .build())
        .withdraw(withdraw)
        .burn(BurnResult.builder()
            .burnTxHash(burnTxHash)
            .burnSucceeded(burnSucceeded)
            .build())
        .build();
  }

  public static SettlementWithdrawBurnResponseDto fail(String reason) {
    return SettlementWithdrawBurnResponseDto.builder()
        .settlement(SettlementResult.builder()
            .released(false)
            .reason(reason)
            .build())
        .build();
  }
}
