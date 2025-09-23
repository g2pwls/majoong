package com.e105.majoong.mypage.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.finance.service.FinApiService;
import com.e105.majoong.mypage.dto.out.AccountHistoryResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@Slf4j
@RequestMapping("/api/v1/members/farmers")
@Tag(name = "Member API", description = "회원관리 API")
public class FarmerMyPageController {

    private final FinApiService finApiService;

    @GetMapping("/accountHistory")
    @Operation(summary = "계좌 거래 내역(출금만)")
    public BaseResponse<AccountHistoryResponseDto> getAccountHistory(
            @AuthenticationPrincipal CustomUserDetails user) {

        AccountHistoryResponseDto dto = finApiService.inquireTransactionHistoryList(user.getMemberUuid());
        return new BaseResponse<>(dto);
    }

}
