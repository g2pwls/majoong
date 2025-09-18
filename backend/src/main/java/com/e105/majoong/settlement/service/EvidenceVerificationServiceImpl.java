package com.e105.majoong.settlement.service;

import com.e105.majoong.settlement.dto.in.ReceiptEvidenceRequest;
import com.e105.majoong.settlement.service.EvidenceVerificationService;
import org.springframework.stereotype.Service;

@Service
public class EvidenceVerificationServiceImpl implements EvidenceVerificationService {
  @Override
  public boolean verify(ReceiptEvidenceRequest req){
    // TODO: OCR 검증/중복/한도 로직
    return true; // 지금은 통과
  }
}
