package com.e105.majoong.settlement.service;

import com.e105.majoong.settlement.dto.in.ReceiptEvidenceRequest;
import com.e105.majoong.settlement.dto.out.ReceiptSettlementResponse;

public interface SettlementService {
  ReceiptSettlementResponse settle(String farmUuid, ReceiptEvidenceRequest req);
}
