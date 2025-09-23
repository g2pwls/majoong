package com.e105.majoong.receipt.dto.out;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter @AllArgsConstructor
public class ReceiptSettlementResponseDto {
  private boolean released;
  private String txHash;
  private String reason;
  private String farmerWallet;
  private String vaultAddress;
  private String releasedAmount;

  public static ReceiptSettlementResponseDto ok(String tx, String farmer, String vault, String amt){
    return new ReceiptSettlementResponseDto(true, tx, "OK", farmer, vault, amt);
  }
  public static ReceiptSettlementResponseDto fail(String reason){
    return new ReceiptSettlementResponseDto(false, null, reason, null, null, null);
  }
}
