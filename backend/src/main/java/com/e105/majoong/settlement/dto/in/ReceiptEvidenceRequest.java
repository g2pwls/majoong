package com.e105.majoong.settlement.dto.in;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter @Setter @NoArgsConstructor
public class ReceiptEvidenceRequest {
  private String evidenceId;          // 멱등 키 (프론트 UUID v4)
  private String category;
  private String certificationImageUrl;
  private String storeName;
  private String address;
  private String phoneNumber;
  private Integer totalAmount;        // 원화 정수(임시: 1원=1토큰 가정)
  private String transactionAt;
  private String content;
  private List<UsageItem> usage;

  @Getter @Setter @NoArgsConstructor
  public static class UsageItem {
    private String item;
    private Integer quantity;
    private Integer amount;
  }
}
