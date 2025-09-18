package com.e105.majoong.farm.service;

import com.e105.majoong.farm.dto.out.DonationUsageResponseDto;
import com.e105.majoong.farm.dto.out.LastMonthUsageResponseDto;

public interface MonthlyDonationService {
    DonationUsageResponseDto getDonationUsage(String farmUuid, int year, int month);
    LastMonthUsageResponseDto getLastMonthUsage(String farmUuid);
}
