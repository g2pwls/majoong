package com.e105.majoong.receipt.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.receipt.dto.in.SettlementWithdrawBurnRequestDto;
import com.e105.majoong.receipt.dto.out.SettlementWithdrawBurnResponseDto;
import com.e105.majoong.receipt.service.SettlementWithdrawBurnService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/settlement-withdraw-burn")
@Slf4j
@Tag(name = "Settlement Withdraw Burn API", description = "정산 → 출금 → 소각 API")
@RequiredArgsConstructor
public class SettlementWithdrawBurnController {

  private final SettlementWithdrawBurnService settlementWithdrawBurnService;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "영수증 저장+정산 요청 (사진 업로드 포함, 자동 출금/소각)")
  public SettlementWithdrawBurnResponseDto settle(
      @AuthenticationPrincipal CustomUserDetails user,
      @Valid @RequestPart("payload") String payloadJson,
      @RequestPart("photo") MultipartFile photo
  ) throws Exception {
    SettlementWithdrawBurnRequestDto req =
        new ObjectMapper().readValue(payloadJson, SettlementWithdrawBurnRequestDto.class);
    return settlementWithdrawBurnService.settleWithdrawBurn(user.getMemberUuid(), req, photo);
  }
}
