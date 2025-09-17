package com.e105.majoong.manageFarm.service;

import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farmer.Farmer;
import com.e105.majoong.common.model.horse.Horse;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.manageFarm.dto.in.FarmInfoUpdateDto;
import com.e105.majoong.manageFarm.dto.in.HorseInfoUpdateDto;
import com.e105.majoong.manageFarm.dto.out.GeoDto;
import com.e105.majoong.manageFarm.dto.out.HorseListResponseDto;
import com.e105.majoong.common.model.horse.HorseRepository;
import com.e105.majoong.common.model.farmer.FarmerRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ManageFarmServiceImpl implements ManageFarmService {

    private final GeoCoding geoCoding;
    private final FarmerRepository farmerRepository;
    private final FarmRepository  farmRepository;
    private final HorseRepository horseRepository;

    @Override
    public String updateFarm(String memberUuid, FarmInfoUpdateDto updateDto) {
        Farmer farmer = farmerRepository.findByMemberUuid(memberUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_USER));

        double[] geo = geoCoding.getCoordinates(updateDto.getAddress());
        double latitude = geo[0];
        double longitude = geo[1];

        Farm farm = farmRepository.save(updateDto.toEntity(farmer, latitude, longitude));
        return farm.getFarmUuid();
    }

    @Override
    public void updateHorse(String memberUuid, String farmUuid, HorseInfoUpdateDto updateDto) {
        Farm farm = farmRepository.findByFarmUuid(farmUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
        Horse horse = horseRepository.save(updateDto.toEntity(farm));
    }

    @Override
    public List<HorseListResponseDto> getHorseList(String farmUuid) {
        Farm farm = farmRepository.findByFarmUuid(farmUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
        List<Horse> horses = horseRepository.findByFarm(farm);
        return horses.stream().map(HorseListResponseDto::toDto).toList();
    }

    @Override
    public GeoDto getGeo(String farmUuid) {
        Farm farm = farmRepository.findByFarmUuid(farmUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
        return GeoDto.toDto(farm);
    }
}
