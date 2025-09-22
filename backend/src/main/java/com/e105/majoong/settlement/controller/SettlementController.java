package com.e105.majoong.settlement.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.settlement.dto.in.ReceiptSettlementRequest;
import com.e105.majoong.settlement.dto.out.ReceiptSettlementResponse;
import com.e105.majoong.settlement.service.SettlementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settlement")
@Tag(name = "Settlement API", description = "정산 관련 API")
@RequiredArgsConstructor
public class SettlementController {

  private final SettlementService settlementService;

  @PostMapping
  @Operation(summary = "목장주 지갑으로 자동 지급하기")
  public ReceiptSettlementResponse settle(
      @AuthenticationPrincipal CustomUserDetails user,
      @Valid @RequestBody ReceiptSettlementRequest req) {

    String memberUuid = user.getMemberUuid();
    return settlementService.settle(memberUuid, req);
  }
}
