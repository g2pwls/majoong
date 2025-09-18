package com.e105.majoong.settlement.controller;

import com.e105.majoong.settlement.dto.in.ReceiptEvidenceRequest;
import com.e105.majoong.settlement.dto.out.ReceiptSettlementResponse;
import com.e105.majoong.settlement.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/donations/farms/{farmUuid}/settlement")
@RequiredArgsConstructor
public class SettlementController {

  private final SettlementService settlementService;

  @PostMapping
  public ReceiptSettlementResponse settle(
      @PathVariable String farmUuid,
      @RequestBody ReceiptEvidenceRequest req
  ){
    return settlementService.settle(farmUuid, req);
  }
}
