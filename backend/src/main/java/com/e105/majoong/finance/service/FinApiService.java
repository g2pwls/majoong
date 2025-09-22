package com.e105.majoong.finance.service;

import com.e105.majoong.finance.dto.out.CreateAccountResponseDto;
import com.e105.majoong.finance.dto.out.FinMemberResponseDto;
import com.e105.majoong.mypage.dto.out.AccountHistoryResponseDto;
import com.e105.majoong.withdraw.dto.in.WithdrawRequestDto;
import com.e105.majoong.withdraw.dto.out.WithdrawResponseDto;

public interface FinApiService {
    FinMemberResponseDto registerMember(String email);

    CreateAccountResponseDto createDemandDepositAccount(String userKey);

    WithdrawResponseDto withdraw(String memberUuid, WithdrawRequestDto requestDto);

    AccountHistoryResponseDto inquireTransactionHistoryList(String memberUuid);
}
