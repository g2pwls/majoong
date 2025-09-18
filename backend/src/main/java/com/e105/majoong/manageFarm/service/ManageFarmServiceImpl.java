package com.e105.majoong.manageFarm.service;

import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farmer.Farmer;
import com.e105.majoong.common.model.horse.Horse;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.common.model.horseState.HorseState;
import com.e105.majoong.common.model.horseState.HorseStateRepository;
import com.e105.majoong.common.utils.S3Uploader;
import com.e105.majoong.manageFarm.dto.in.FarmInfoUpdateDto;
import com.e105.majoong.manageFarm.dto.in.HorseInfoUpdateDto;
import com.e105.majoong.manageFarm.dto.in.ReportHorseStatusDto;
import com.e105.majoong.manageFarm.dto.out.GeoDto;
import com.e105.majoong.manageFarm.dto.out.HorseImageDto;
import com.e105.majoong.manageFarm.dto.out.HorseListResponseDto;
import com.e105.majoong.common.model.horse.HorseRepository;
import com.e105.majoong.common.model.farmer.FarmerRepository;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ManageFarmServiceImpl implements ManageFarmService {

    private final GeoCoding geoCoding;
    private final FarmerRepository farmerRepository;
    private final FarmRepository farmRepository;
    private final HorseRepository horseRepository;
    private final S3Uploader s3Uploader;
    private final HorseStateRepository horseStateRepository;
    //test
    private final OpenAIService openAIService;

    private static final String FARM_IMAGE_DIR = "farm";
    private static final String HORSE_IMAGE_DIR = "horse/profile";
    private static final String HORSE_STATE_DIR = "horse/state";

    @Override
    public String updateFarm(String memberUuid, FarmInfoUpdateDto updateDto) {
        Farmer farmer = farmerRepository.findByMemberUuid(memberUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_USER));

        double[] geo = geoCoding.getCoordinates(updateDto.getAddress());
        double latitude = geo[0];
        double longitude = geo[1];
        try {
            String imageUrl = s3Uploader.upload(updateDto.getProfileImage(), FARM_IMAGE_DIR);
            Farm farm = farmRepository.save(updateDto.toEntity(farmer, latitude, longitude, imageUrl));
            return farm.getFarmUuid();
        } catch (IOException e) {
            throw new BaseException(BaseResponseStatus.S3_UPLOAD_FAILED);
        }
    }

    @Override
    public void updateHorse(String memberUuid, HorseInfoUpdateDto updateDto) {
        Farm farm = farmRepository.findByFarmUuid(updateDto.getFarmUuid()).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
        try {
            String imageUrl = s3Uploader.upload(updateDto.getProfileImage(), HORSE_IMAGE_DIR);
            horseRepository.save(updateDto.toEntity(farm, imageUrl));
        } catch (IOException e) {
            throw new BaseException(BaseResponseStatus.S3_UPLOAD_FAILED);
        }
    }

    @Override
    public List<HorseListResponseDto> getHorseList(String memberUuid, String farmUuid) {
        Farm farm = farmRepository.findByFarmUuid(farmUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
        if (!farm.getMemberUuid().equals(memberUuid)) {
            throw new BaseException(BaseResponseStatus.NO_ACCESS_AUTHORITY);
        }
        List<Horse> horses = horseRepository.findByFarm(farm);
        return horses.stream().map(HorseListResponseDto::toDto).toList();
    }

    @Override
    public GeoDto getGeo(String farmUuid) {
        Farm farm = farmRepository.findByFarmUuid(farmUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
        return GeoDto.toDto(farm);
    }

    @Override
    @Transactional
    public void reportHorseState(String memberUuid, String farmUuid, Long horseNumber, ReportHorseStatusDto dto) {
        Farm farm = farmRepository.findByFarmUuid(farmUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
        if (!farm.getMemberUuid().equals(memberUuid)) {
            throw new BaseException(BaseResponseStatus.NO_ACCESS_AUTHORITY);
        }
        if (!horseRepository.existsByHorseNumber(horseNumber)) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_HORSE);
        }
        try {
            String frontImage = s3Uploader.upload(dto.getFrontImage(), HORSE_STATE_DIR);
            String leftSideImage = s3Uploader.upload(dto.getLeftSideImage(), HORSE_STATE_DIR);
            String rightSideImage = s3Uploader.upload(dto.getRightSideImage(), HORSE_STATE_DIR);
            String stableImage = s3Uploader.upload(dto.getStableImage(), HORSE_STATE_DIR);
            HorseState state = horseStateRepository.save(dto.toEntity(farmUuid, memberUuid, horseNumber,
                    frontImage, leftSideImage, rightSideImage, stableImage));

            //test
            try {
                String aiSummary = openAIService.analyzeHorseImages(HorseImageDto.toDto(state))
                        .block();  // AI 결과를 기다림
                state.updateAISummary(aiSummary);
            } catch (Exception e) {
                log.error("AI 분석 실패", e);
            }
        } catch (IOException e) {
            throw new BaseException(BaseResponseStatus.S3_UPLOAD_FAILED);
        }
    }
}