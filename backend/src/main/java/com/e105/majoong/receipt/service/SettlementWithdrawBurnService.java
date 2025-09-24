package com.e105.majoong.receipt.service;

import com.e105.majoong.receipt.dto.in.SettlementWithdrawBurnRequestDto;
import com.e105.majoong.receipt.dto.out.SettlementWithdrawBurnResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface SettlementWithdrawBurnService {
  SettlementWithdrawBurnResponseDto settleWithdrawBurn(
      String memberUuid,
      SettlementWithdrawBurnRequestDto req,
      MultipartFile photo
  );
}
