package com.e105.majoong.mypage.service;

import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.donationHistory.DonationHistoryRepository;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.common.model.farmer.Farmer;
import com.e105.majoong.common.model.farmer.FarmerRepository;
import com.e105.majoong.common.utils.S3Uploader;
import com.e105.majoong.mypage.dto.out.VaultResponseDto;
import java.io.IOException;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class FarmerMyPageServiceImpl implements FarmerMyPageService {

    private final S3Uploader s3Uploader;
    private final DonationHistoryRepository donationHistoryRepository;
    private final FarmerRepository farmerRepository;
    private final FarmRepository farmRepository;

    private static final String FARM_IMAGE_DIR = "farm";

    @Override
    public VaultResponseDto getVaultHistoryByPage(
            String memberUuid, int page, int size, LocalDate startDate, LocalDate endDate) {
        if (!farmerRepository.existsByMemberUuid(memberUuid)) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_FARMER);
        }

        return donationHistoryRepository.findVaultHistoryByPage(
                memberUuid, page, size, startDate, endDate);
    }

    @Override
    @Transactional
    public void updateFarmers(String memberUuid,  String farmName, String phoneNumber, MultipartFile image) {
        Farmer farmer = farmerRepository.findByMemberUuid(memberUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_FARMER));
        Farm farm = farmRepository.findByMemberUuid(memberUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
        if (image != null) {
            try {
                String imageUrl = s3Uploader.update(farm.getProfileImage(), image, FARM_IMAGE_DIR);
                farm.updateProfileImage(imageUrl);
            } catch (IOException e) {
                throw new BaseException(BaseResponseStatus.S3_UPLOAD_FAILED);
            }
        }
        if (farmName != null) {
            farmer.updateFarmName(farmName);
            farm.updateFarmName(farmName);
        }
        if (phoneNumber != null) {
            farm.updatePhoneNumber(phoneNumber);
        }
    }
}
