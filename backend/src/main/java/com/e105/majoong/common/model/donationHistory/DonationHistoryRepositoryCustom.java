package com.e105.majoong.common.model.donationHistory;

import com.e105.majoong.mypage.dto.out.DonationHistoryDetailResponseDto;
import com.e105.majoong.mypage.dto.out.DonationResponseDto;
import com.e105.majoong.mypage.dto.out.VaultResponseDto;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Map;
import java.util.Set;

public interface DonationHistoryRepositoryCustom {
    DonationResponseDto findDonationHistoryByPage(
            String memberUuid, int page, int size, LocalDate startDate, LocalDate endDate
    );

    DonationHistoryDetailResponseDto findDonationHistoryDetail(String memberUuid, Long donationHistoryId);

    long getMonthlyTotalDonation(String farmUuid, int year, int month);

    VaultResponseDto findVaultHistoryByPage(
            String memberUuid, int page, int size, LocalDate startDate, LocalDate endDate);

    Map<String, Long> getMonthlyDonationByFarmList(Set<String> farmUuids, YearMonth ym);

    long countUniqueDonatorsByFarm(String farmUuid);
}
