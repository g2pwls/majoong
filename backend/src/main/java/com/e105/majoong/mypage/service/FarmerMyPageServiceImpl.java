package com.e105.majoong.mypage.service;

import com.e105.majoong.blockchain.props.ChainProps;
import com.e105.majoong.blockchain.service.VaultService;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.donationHistory.DonationHistoryRepository;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.common.model.farmVault.FarmVaultRepository;
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
    private final FarmVaultRepository farmVaultRepository;
    private final VaultService vaultService;
    private final ChainProps chainProps;
    private static final String FARM_IMAGE_DIR = "farm";

    @Override
    public VaultResponseDto getVaultHistoryByPage(
        String memberUuid, int page, int size, LocalDate startDate, LocalDate endDate) {

      if (!farmerRepository.existsByMemberUuid(memberUuid)) {
        throw new BaseException(BaseResponseStatus.NO_EXIST_FARMER);
      }

      // 1) 기존 방식으로 기본 DTO (totalDonation, usedAmount, history page 포함) 조회
      VaultResponseDto base = donationHistoryRepository.findVaultHistoryByPage(
          memberUuid, page, size, startDate, endDate);

      // 2) 활성 금고 찾기 (memberUuid 기준)
      var vault = farmVaultRepository
          .findTopByMemberUuidAndStatusOrderByIdDesc(memberUuid, com.e105.majoong.common.model.farmVault.FarmVault.Status.ACTIVE)
          .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_ACTIVE_FARM_VAULT));

      // 3) 온체인 잔액 읽어서 KRW로 환산 → currentBalance만 교체
      Long currentBalanceKrw;
      try {
        var wei = vaultService.getVaultTokenBalanceWei(vault.getVaultAddress());
        long tokens = wei.divide(java.math.BigInteger.TEN.pow(18)).longValueExact(); // 정수 토큰 정책
        currentBalanceKrw = Math.multiplyExact(tokens, chainProps.getKrwPerToken());
      } catch (Exception e) {
        // 온체인 조회 실패 시 안전한 폴백: DB 누적 기준
        currentBalanceKrw = base.getTotalDonation() - base.getUsedAmount();
        log.warn("[MyPage] on-chain balance read failed; fallback used: {}", e.getMessage());
      }

      // 4) currentBalance만 교체하여 반환 (나머지는 base 그대로 유지)
      return VaultResponseDto.toDto(
          base.getTotalDonation(),
          base.getUsedAmount(),
          currentBalanceKrw,
          base.getVaultHistoryResponseDtos()
      );
    }

    @Override
    @Transactional
    public void updateFarmers(String memberUuid, String farmName, String phoneNumber, MultipartFile image,
                              String description) {
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
        if (description != null) {
            farm.updateDescription(description);
        }
    }

    @Override
    public boolean checkCreateFarm(String memberUuid) {
        return farmRepository.existsByMemberUuid(memberUuid);
    }
}
