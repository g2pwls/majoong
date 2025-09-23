package com.e105.majoong.withdraw.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.blockchain.props.ChainProps;
import com.e105.majoong.blockchain.service.BurnService;
import com.e105.majoong.blockchain.service.WalletService;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.finance.service.FinApiService;
import com.e105.majoong.withdraw.dto.in.WithdrawRequestDto;
import com.e105.majoong.withdraw.dto.out.WithdrawResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;

@Slf4j
@RestController
@RequestMapping("/api/v1/withdraw")
@Tag(name = "Withdraw API", description = "출금 관련 API")
@RequiredArgsConstructor
public class WithdrawController {

  private final FinApiService finApiService;
  private final WalletService walletService;
  private final BurnService burnService;
  private final ChainProps chainProps;

  @PostMapping
  @Operation(summary = "출금하기")
  public BaseResponse<WithdrawResponseDto> withdraw(
      @AuthenticationPrincipal CustomUserDetails user,
      @RequestBody WithdrawRequestDto requestDto) {

    // 1) 오프체인 원화 출금
    WithdrawResponseDto response = finApiService.withdraw(user.getMemberUuid(), requestDto);

    // 2) 온체인 소각 (원화 → 토큰 변환 후)
    try {
      String farmer = walletService.getAddressByMemberUuid(user.getMemberUuid());
      BigInteger amountWei = krwToWei(requestDto.getMoney(), chainProps.getKrwPerToken());
      String txHash = burnService.burnFromFarmer(farmer, amountWei);
      log.info("[WITHDRAW] burned {} wei from {}, tx={}", amountWei, farmer, txHash);
    } catch (Exception ex) {
      log.error("[WITHDRAW] burn failed", ex);
      // throw new RuntimeException("Token burn failed", ex);
    }

    return new BaseResponse<>(response);
  }

  /** KRW 문자열 → 토큰 **/
  private static BigInteger krwToWei(String krwStr, long krwPerToken) {
    BigDecimal krw = new BigDecimal(krwStr);
    BigDecimal tokens = krw
        .divide(BigDecimal.valueOf(krwPerToken), 18, RoundingMode.DOWN); // MARON 수량
    return tokens.movePointRight(18).toBigIntegerExact(); // 18 decimals → wei
  }
}
