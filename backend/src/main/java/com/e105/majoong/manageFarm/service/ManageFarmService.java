package com.e105.majoong.manageFarm.service;

import com.e105.majoong.manageFarm.dto.in.FarmInfoCreateDto;
import com.e105.majoong.manageFarm.dto.in.HorseInfoUpdateDto;
import com.e105.majoong.manageFarm.dto.in.ReportHorseStatusDto;
import com.e105.majoong.manageFarm.dto.out.GeoDto;
import com.e105.majoong.manageFarm.dto.out.HorseListResponseDto;
import java.util.List;
import reactor.core.publisher.Mono;

public interface ManageFarmService {
    String updateFarm(String memberUuid, FarmInfoCreateDto updateDto);

    void updateHorse(String memberUuid, HorseInfoUpdateDto updateDto);

    List<HorseListResponseDto> getHorseList(String memberUuid, String farmUuid);

    GeoDto getGeo(String farmUuid);

    Mono<String> reportHorseState(String memberUuid, String farmUuid, Long horseNumber, ReportHorseStatusDto dto);

}
