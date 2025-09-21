package com.e105.majoong.withdraw.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.finance.service.FinApiService;
import com.e105.majoong.withdraw.dto.in.WithdrawRequestDto;
import com.e105.majoong.withdraw.dto.out.WithdrawResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/withdraw")
@Tag(name = "withdraw API", description = "출금 관련 API")
@RequiredArgsConstructor
public class WithdrawController {

    private final FinApiService finApiService;

    @PostMapping
    @Operation(summary = "출금하기")
    public BaseResponse<WithdrawResponseDto> withdraw(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody WithdrawRequestDto requestDto) {
        WithdrawResponseDto response = finApiService.withdraw(user.getMemberUuid(), requestDto);
        return new BaseResponse<>(response);
    }
}
