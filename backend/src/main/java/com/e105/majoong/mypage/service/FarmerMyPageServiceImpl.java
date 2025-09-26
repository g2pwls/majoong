package com.e105.majoong.mypage.service;

import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.donationHistory.DonationHistoryRepository;
import com.e105.majoong.common.model.donationHistory.DonationHistoryRepositoryCustom;
import com.e105.majoong.common.model.farmer.FarmerRepository;
import com.e105.majoong.mypage.dto.out.VaultResponseDto;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class FarmerMyPageServiceImpl implements FarmerMyPageService {

    private final DonationHistoryRepository donationHistoryRepository;
    private final FarmerRepository farmerRepository;

    @Override
    public VaultResponseDto getVaultHistoryByPage(
            String memberUuid, int page, int size, LocalDate startDate, LocalDate endDate) {
        if (!farmerRepository.existsByMemberUuid(memberUuid)) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_FARMER);
        }

        return donationHistoryRepository.findVaultHistoryByPage(
                memberUuid, page, size, startDate, endDate);
    }
}
