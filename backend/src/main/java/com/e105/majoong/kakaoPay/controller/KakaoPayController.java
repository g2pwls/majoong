package com.e105.majoong.kakaoPay.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.kakaoPay.dto.in.OrderRequestDto;
import com.e105.majoong.kakaoPay.dto.out.ApproveResponseDto;
import com.e105.majoong.kakaoPay.dto.out.ReadyResponseDto;
import com.e105.majoong.kakaoPay.util.KakaoPayProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/kakao-pay")
@Tag(name = "KakaoPay", description = "KakaoPay 기능 관련 API")
public class KakaoPayController {

    private final KakaoPayProvider kakaoPayProvider;

    @PostMapping("/ready")
    @Operation(summary = "카카오 페이 결제 시작")
    public BaseResponse<ReadyResponseDto> ready(
            @RequestBody OrderRequestDto request,
            @AuthenticationPrincipal CustomUserDetails user) {
        return new BaseResponse<>(kakaoPayProvider.ready(request, user.getMemberUuid()));
    }

    @GetMapping("/approve")
    @Operation(summary = "카카오 페이 결제 승인")
    public BaseResponse<ApproveResponseDto> approve(
            @RequestParam("pg_token") String pgToken) {
        return new BaseResponse<>(kakaoPayProvider.approve(pgToken));
    }
}
