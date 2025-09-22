package com.e105.majoong.settlement.controller;

import com.e105.majoong.settlement.dto.in.ReceiptSettlementRequest;
import com.e105.majoong.settlement.dto.out.ReceiptSettlementResponse;
import com.e105.majoong.settlement.service.SettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settlement")
@RequiredArgsConstructor
public class SettlementController {

  private final SettlementService settlementService;

  @PostMapping
  public ReceiptSettlementResponse settle(
      @AuthenticationPrincipal com.e105.majoong.auth.security.CustomUserDetails user,
      @Valid @RequestBody ReceiptSettlementRequest req) {

    String memberUuid = user.getMemberUuid();
    return settlementService.settle(memberUuid, req);
  }
}
