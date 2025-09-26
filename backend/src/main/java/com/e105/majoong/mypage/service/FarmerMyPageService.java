package com.e105.majoong.mypage.service;

import com.e105.majoong.mypage.dto.out.DonationResponseDto;
import com.e105.majoong.mypage.dto.out.VaultResponseDto;
import java.time.LocalDate;

public interface FarmerMyPageService {
    VaultResponseDto getVaultHistoryByPage(
            String memberUuid, int page, int size, LocalDate startDate, LocalDate endDate);
}
