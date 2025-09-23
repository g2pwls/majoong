package com.e105.majoong.receipt.service;

import com.e105.majoong.receipt.dto.in.ReceiptSettlementRequest;
import com.e105.majoong.receipt.dto.out.ReceiptSettlementResponse;

public interface ReceiptSettlementService {
  ReceiptSettlementResponse settle(String memberUuid, ReceiptSettlementRequest req);
}
