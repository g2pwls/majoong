package com.e105.majoong.kakaoPay.controller;

import com.e105.majoong.kakaoPay.dto.in.OrderRequestDto;
import com.e105.majoong.kakaoPay.dto.out.ApproveResponse;
import com.e105.majoong.kakaoPay.dto.out.ReadyResponse;
import com.e105.majoong.kakaoPay.util.KakaoPayProvider;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/kakao-pay")
@Tag(name = "KakaoPay", description = "KakaoPay 기능 관련 API")
public class KakaoPayController {

    private final KakaoPayProvider kakaoPayProvider;

    // 카카오페이 결제 준비
    @PostMapping("/ready")
    public ReadyResponse ready(@RequestBody OrderRequestDto request) {
        return kakaoPayProvider.ready(request);
    }

    // 카카오페이 결제 승인
    @GetMapping("/approve")
    public ApproveResponse approve(@RequestParam("pg_token") String pgToken) {
        return kakaoPayProvider.approve(pgToken);
    }
}
