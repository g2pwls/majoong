package com.e105.majoong.farm.service;

import com.e105.majoong.common.model.donationHistory.DonationHistoryRepository;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.common.model.horse.HorseRepository;
import com.e105.majoong.farm.dto.out.*;
import com.e105.majoong.common.model.bookmark.BookmarkRepository;
import com.e105.majoong.common.model.myScore.MyScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmServiceImpl implements FarmService {

    private final FarmRepository farmRepository;
    private final BookmarkRepository bookmarkRepository;
    private final HorseRepository horseRepository;
    private final MyScoreRepository myScoreRepository;
    private final DonationHistoryRepository donationHistoryRepository;

    @Override
    public Page<FarmListResponseDto> searchFarms(String farmName, int page, int size, String memberUuid) {
        Page<Farm> farms;

        if (farmName == null || farmName.isBlank()) {
            farms = farmRepository.findAll(PageRequest.of(page, size));
        } else {
            farms = farmRepository.findByFarmNameContaining(farmName, PageRequest.of(page, size));
        }

        return farms.map(farm -> {
            boolean isBookmark = false;
            if (memberUuid != null && !memberUuid.isBlank()) {
                isBookmark = bookmarkRepository.existsByMemberUuidAndFarmUuid(memberUuid, farm.getFarmUuid());
            }

            List<FarmHorseResponseDto> horseList = horseRepository.findByFarmAndDeletedAtIsNull(farm).stream()
                    .map(FarmHorseResponseDto::toDto)
                    .collect(Collectors.toList());

            return FarmListResponseDto.toDto(farm, horseList, isBookmark);
        });
    }

    @Override
    public FarmDetailResponseDto getFarmDetail(String farmUuid, String memberUuid) {
        Farm farm = farmRepository.findByFarmUuid(farmUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));

        List<FarmHorseDetailResponseDto> horseDtos = horseRepository.findByFarmIdAndDeletedAtIsNull(farm.getId())
                .stream()
                .map(FarmHorseDetailResponseDto::toDto)
                .collect(Collectors.toList());

        List<MonthlyScoreResponseDto> monthlyScores = myScoreRepository.findByFarmUuid(farmUuid)
                .stream()
                .map(MonthlyScoreResponseDto::toDto)
                .collect(Collectors.toList());

        LocalDate now = LocalDate.now();
        long monthTotalAmount = donationHistoryRepository.getMonthlyTotalDonation(
                farmUuid,
                now.getYear(),
                now.getMonthValue()
        ) * 100;

        boolean bookmarked = bookmarkRepository.existsByMemberUuidAndFarmUuid(memberUuid, farmUuid);

        return FarmDetailResponseDto.toDto(farm, monthlyScores, horseDtos, monthTotalAmount, bookmarked);
    }

    @Override
    public FarmDetailResponseDto getMyFarm(String memberUuid) {
        Farm farm = farmRepository.findByMemberUuid(memberUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_MY_FARM));

        List<FarmHorseDetailResponseDto> horseDtos = horseRepository.findByFarmIdAndDeletedAtIsNull(farm.getId())
                .stream()
                .map(FarmHorseDetailResponseDto::toDto)
                .collect(Collectors.toList());

        List<MonthlyScoreResponseDto> monthlyScores = myScoreRepository.findByFarmUuid(farm.getFarmUuid())
                .stream()
                .map(MonthlyScoreResponseDto::toDto)
                .collect(Collectors.toList());

        LocalDate now = LocalDate.now();
        long monthTotalAmount = donationHistoryRepository.getMonthlyTotalDonation(
                farm.getFarmUuid(),
                now.getYear(),
                now.getMonthValue()
        ) * 100;
        boolean bookmarked = bookmarkRepository.existsByMemberUuidAndFarmUuid(memberUuid, farm.getFarmUuid());

        return FarmDetailResponseDto.toDto(farm, monthlyScores, horseDtos, monthTotalAmount, bookmarked);
    }
}
