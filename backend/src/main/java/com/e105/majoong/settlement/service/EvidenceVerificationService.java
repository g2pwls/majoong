package com.e105.majoong.settlement.service;

import com.e105.majoong.settlement.dto.in.ReceiptEvidenceRequest;

public interface EvidenceVerificationService {
  boolean verify(ReceiptEvidenceRequest req);
}
