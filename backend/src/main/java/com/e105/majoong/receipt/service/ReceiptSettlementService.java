package com.e105.majoong.receipt.service;

import com.e105.majoong.receipt.dto.in.ReceiptSettlementRequestDto;
import com.e105.majoong.receipt.dto.out.ReceiptSettlementResponseDto;

public interface ReceiptSettlementService {
  ReceiptSettlementResponseDto settle(String memberUuid, ReceiptSettlementRequestDto req);
}
