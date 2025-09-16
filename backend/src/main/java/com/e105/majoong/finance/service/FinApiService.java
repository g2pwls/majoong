package com.e105.majoong.finance.service;

import com.e105.majoong.finance.dto.out.CreateAccountResponseDto;
import com.e105.majoong.finance.dto.out.FinMemberResponseDto;

public interface FinApiService {
    FinMemberResponseDto registerMember(String email);

    CreateAccountResponseDto createDemandDepositAccount(String userKey);
}
