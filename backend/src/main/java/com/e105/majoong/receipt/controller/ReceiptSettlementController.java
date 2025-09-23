package com.e105.majoong.receipt.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.receipt.dto.in.ReceiptSettlementRequestDto;
import com.e105.majoong.receipt.dto.out.ReceiptSettlementResponseDto;
import com.e105.majoong.receipt.service.ReceiptSettlementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/receipt/settlement")
@Tag(name = "Receipt Settlement API", description = "영수증 정산 관련 API")
@RequiredArgsConstructor
public class ReceiptSettlementController {

  private final ReceiptSettlementService receiptSettlementService;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "영수증 저장+정산 요청 (사진 업로드 포함)")
  public ReceiptSettlementResponseDto settle(
      @AuthenticationPrincipal CustomUserDetails user,
      @Valid @RequestPart("payload") ReceiptSettlementRequestDto req,
      @RequestPart(value = "photo", required = false) MultipartFile photo
  ) {
    return receiptSettlementService.settle(user.getMemberUuid(), req, photo);
  }
}
