package com.e105.majoong.member.controller;

import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.member.dto.in.VerificationRequestDto;
import com.e105.majoong.member.dto.out.VerificationResponseDto;
import com.e105.majoong.member.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping("/verification")
    public BaseResponse<VerificationResponseDto> verify(@RequestBody VerificationRequestDto requestDto) {
        VerificationResponseDto result = verificationService.verify(requestDto);
        return new BaseResponse<>(result);
    }
}
