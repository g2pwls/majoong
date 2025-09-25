package com.e105.majoong.member.service;

import com.e105.majoong.member.dto.in.VerificationRequestDto;
import com.e105.majoong.member.dto.out.VerificationResponseDto;

public interface VerificationService {
    VerificationResponseDto verify(VerificationRequestDto req);
}
