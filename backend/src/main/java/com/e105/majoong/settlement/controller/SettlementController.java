package com.e105.majoong.settlement.controller;

import com.e105.majoong.settlement.dto.in.ReceiptSettlementRequest;
import com.e105.majoong.settlement.dto.out.ReceiptSettlementResponse;
import com.e105.majoong.settlement.service.SettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settlement")
@RequiredArgsConstructor
public class SettlementController {

  private final SettlementService settlementService;

  @PostMapping
  public ReceiptSettlementResponse settle(@Valid @RequestBody ReceiptSettlementRequest req){
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String memberUuid = ((com.e105.majoong.auth.security.CustomUserDetails) auth.getPrincipal())
        .getMemberUuid();
    return settlementService.settle(memberUuid, req);
  }
}
