package com.e105.majoong.settlement.dto.out;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter @AllArgsConstructor
public class ReceiptSettlementResponse {
  private boolean released;
  private String txHash;
  private String reason;
  private String farmerWallet;
  private String vaultAddress;
  private String releasedAmount;

  public static ReceiptSettlementResponse ok(String tx, String farmer, String vault, String amt){
    return new ReceiptSettlementResponse(true, tx, "OK", farmer, vault, amt);
  }
  public static ReceiptSettlementResponse fail(String reason){
    return new ReceiptSettlementResponse(false, null, reason, null, null, null);
  }
}
