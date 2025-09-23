package com.e105.majoong.receipt.dto.in;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptSettlementRequestDto {

  /** receipt_history.ai_summary */
  @NotBlank @Size(max = 1000)
  private String reason;

  /** store_* 컬럼 매핑 */
  @NotNull
  private StoreInfo storeInfo;

  /** receipt_history.content */
  @Size(max=1000)
  private String content;

  /** receipt_detail_history 로 저장 */
  @NotEmpty
  private List<Item> items;

  /** receipt_history.total_amount = receiptAmount */
  @NotNull @Positive
  private Integer receiptAmount;

  /** receipt_history.photo_url */
  @Size(max = 255)
  private String photoUrl;

  /** receipt_history.category_id = receipt_category.id */
  @NotNull
  private Long categoryId;

  /** 멱등키 (필수) */
  @NotBlank @Size(max = 36)
  private String idempotencyKey;

  // ---------- inner ----------
  @Getter
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class StoreInfo {
    @NotBlank @Size(max = 255) private String name;    // → store_name
    @Size(max = 255)           private String address; // → store_address
    @Size(max = 15)            private String phone;   // → store_number
  }

  @Getter
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Item {
    @NotBlank @Size(max = 255) private String name;    // → detail.item_name
    @NotNull @Positive         private Integer quantity;    // → detail.quantity
    @NotNull @Positive         private Integer unitPrice;   // → detail.price_per_item
    @NotNull @Positive         private Integer totalPrice;  // 검증용(= unit*qty)
  }

}
