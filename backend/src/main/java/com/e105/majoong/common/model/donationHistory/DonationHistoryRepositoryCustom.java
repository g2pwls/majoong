package com.e105.majoong.common.model.donationHistory;

import com.e105.majoong.mypage.dto.out.DonationHistoryDetailResponseDto;
import com.e105.majoong.mypage.dto.out.DonationResponseDto;
import java.time.LocalDate;

public interface DonationHistoryRepositoryCustom {
    DonationResponseDto findDonationHistoryByPage(
            String memberUuid, int page, int size, LocalDate startDate, LocalDate endDate
    );

    DonationHistoryDetailResponseDto findDonationHistoryDetail(String memberUuid, Long donationHistoryId);

    long getMonthlyTotalDonation(String farmUuid, int year, int month);
}
