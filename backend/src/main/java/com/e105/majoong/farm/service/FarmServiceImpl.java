package com.e105.majoong.farm.service;

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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmServiceImpl implements FarmService {

    private final FarmRepository farmRepository;
    private final BookmarkRepository bookmarkRepository;
    private final HorseRepository horseRepository;
    private final MyScoreRepository myScoreRepository;

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

            List<FarmHorseResponseDto> horseList = horseRepository.findByFarm(farm).stream()
                    .map(FarmHorseResponseDto::toDto)
                    .collect(Collectors.toList());

            return FarmListResponseDto.toDto(farm, horseList, isBookmark);
        });
    }

    @Override
    public FarmDetailResponseDto getFarmDetail(String farmUuid) {
        Farm farm = farmRepository.findByFarmUuid(farmUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));

        List<FarmHorseDetailResponseDto> horseDtos = horseRepository.findByFarmId(farm.getId())
                .stream()
                .map(FarmHorseDetailResponseDto::toDto)
                .collect(Collectors.toList());

        List<MonthlyScoreResponseDto> monthlyScores = myScoreRepository.findByFarmUuid(farmUuid)
                .stream()
                .map(MonthlyScoreResponseDto::toDto)
                .collect(Collectors.toList());

        long monthTotalAmount = 0L; // TODO: 블록체인 미구현으로, 실제 합계 로직으로 교체 필요

        return FarmDetailResponseDto.toDto(farm, monthlyScores, horseDtos, monthTotalAmount);
    }

    @Override
    public FarmDetailResponseDto getMyFarm(String memberUuid) {
        Farm farm = farmRepository.findByMemberUuid(memberUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_MY_FARM));

        List<FarmHorseDetailResponseDto> horseDtos = horseRepository.findByFarmId(farm.getId())
                .stream()
                .map(FarmHorseDetailResponseDto::toDto)
                .collect(Collectors.toList());

        List<MonthlyScoreResponseDto> monthlyScores = myScoreRepository.findByFarmUuid(farm.getFarmUuid())
                .stream()
                .map(MonthlyScoreResponseDto::toDto)
                .collect(Collectors.toList());

        long monthTotalAmount = 0L; // TODO: 블록체인 연동 후 교체

        return FarmDetailResponseDto.toDto(farm, monthlyScores, horseDtos, monthTotalAmount);
    }
}
