package com.e105.majoong.settlement.dto.in;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class ReceiptSettlementRequest {

  @NotBlank @Size(max=36)
  private String idempotencyKey;

  @NotBlank @Size(max=128)
  private String storeName;

  @NotBlank @Size(max=128)
  private String productName;

  @NotNull @Min(1)
  private Integer quantity;

  @NotNull @Min(1)
  private Integer totalAmount;

  @NotNull
  @JsonFormat(pattern = "yyyy-MM-dd")
  private LocalDate purchaseDate;
}
