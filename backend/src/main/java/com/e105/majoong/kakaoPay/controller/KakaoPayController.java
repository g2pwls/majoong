package com.e105.majoong.kakaoPay.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.redis.RedisService;
import com.e105.majoong.donation.dto.in.DonationRequestDto;
import com.e105.majoong.donation.service.DonateService;
import com.e105.majoong.kakaoPay.dto.in.OrderRequestDto;
import com.e105.majoong.kakaoPay.dto.out.ApproveResponseDto;
import com.e105.majoong.kakaoPay.dto.out.ReadyResponseDto;
import com.e105.majoong.kakaoPay.util.KakaoPayProvider;
import com.e105.majoong.donation.dto.out.DonationResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/kakao-pay")
@Tag(name = "KakaoPay", description = "KakaoPay 기능 관련 API")
public class KakaoPayController {

    private final KakaoPayProvider kakaoPayProvider;
    private final DonateService donateService;
    private final RedisService redisService;

    @Value("${app.frontend}")
    private String frontend;

    @PostMapping("/ready")
    @Operation(summary = "카카오 페이 결제 시작")
    public BaseResponse<ReadyResponseDto> ready(
            @RequestBody OrderRequestDto request,
            @AuthenticationPrincipal CustomUserDetails user) {
        return new BaseResponse<>(kakaoPayProvider.ready(request, user.getMemberUuid()));
    }

    @GetMapping("/approve")
    @Operation(summary = "카카오 페이 결제 승인 & 기부 처리")
    public RedirectView approve(
            @RequestParam("pg_token") String pgToken,
            @AuthenticationPrincipal CustomUserDetails user) throws Exception {

        String memberUuid = user.getMemberUuid();

        // 1) 카카오 결제 승인 (memberUuid와 pgToken을 넘겨서 내부에서 tid 복구)
        ApproveResponseDto approveRes = kakaoPayProvider.approve(pgToken, memberUuid);

        // 2) 기부 처리
        String farmUuid = approveRes.getPartnerOrderId();
        int amount = approveRes.getAmount().getTotal();

        DonationRequestDto donationReq = new DonationRequestDto(farmUuid, amount);
        DonationResponseDto donationRes = donateService.donate(donationReq, memberUuid);

        return new RedirectView(frontend + "/kakao-pay/approve?pg_token=" + pgToken);
    }
}