package com.e105.majoong.receipt.service;

import com.e105.majoong.receipt.dto.in.ReceiptSettlementRequestDto;
import com.e105.majoong.receipt.dto.out.ReceiptSettlementResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface ReceiptSettlementService {
  ReceiptSettlementResponseDto settle(String memberUuid, ReceiptSettlementRequestDto req, MultipartFile photo);
}
