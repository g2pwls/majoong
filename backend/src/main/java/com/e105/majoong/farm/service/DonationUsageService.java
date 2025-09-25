package com.e105.majoong.farm.service;

import com.e105.majoong.farm.dto.out.UsageDetailResponseDto;

public interface DonationUsageService {
    UsageDetailResponseDto getUsageDetail(String farmUuid, Long usageId);
}
