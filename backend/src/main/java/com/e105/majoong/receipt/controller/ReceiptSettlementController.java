package com.e105.majoong.receipt.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.receipt.dto.in.ReceiptSettlementRequestDto;
import com.e105.majoong.receipt.dto.out.ReceiptSettlementResponseDto;
import com.e105.majoong.receipt.service.ReceiptSettlementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/receipt/settlement")
@Tag(name = "Receipt Settlement API", description = "영수증 정산 관련 API")
@RequiredArgsConstructor
public class ReceiptSettlementController {

  private final ReceiptSettlementService receiptSettlementService;

  @PostMapping
  @Operation(summary = "목장주 지갑으로 자동 지급하기")
  public ReceiptSettlementResponseDto settle(
      @AuthenticationPrincipal CustomUserDetails user,
      @Valid @RequestBody ReceiptSettlementRequestDto req) {

    String memberUuid = user.getMemberUuid();

    return receiptSettlementService.settle(memberUuid, req);
  }
}
