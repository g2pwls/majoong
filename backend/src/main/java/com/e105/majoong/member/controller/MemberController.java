package com.e105.majoong.member.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.member.dto.in.VerificationRequestDto;
import com.e105.majoong.member.dto.out.DonatorResponseDto;
import com.e105.majoong.member.dto.out.FarmerResponseDto;
import com.e105.majoong.member.dto.out.VerificationResponseDto;
import com.e105.majoong.member.service.MemberService;
import com.e105.majoong.member.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final VerificationService verificationService;
    private final MemberService memberService;

    @PostMapping("/verification")
    public BaseResponse<VerificationResponseDto> verify(@RequestBody VerificationRequestDto requestDto) {
        VerificationResponseDto result = verificationService.verify(requestDto);
        return new BaseResponse<>(result);
    }

    @GetMapping("/donators")
    public BaseResponse<DonatorResponseDto> donators(@AuthenticationPrincipal CustomUserDetails user) {
        DonatorResponseDto result = memberService.getDonatorInfo(user.getMemberUuid());
        return new BaseResponse<>(result);
    }

    @GetMapping("/farmers")
    public BaseResponse<FarmerResponseDto> farmers(@AuthenticationPrincipal CustomUserDetails user) {
        FarmerResponseDto result = memberService.getFarmerInfo(user.getMemberUuid());
        return new BaseResponse<>(result);
    }
}
