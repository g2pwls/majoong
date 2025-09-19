package com.e105.majoong.farm.service;

import com.e105.majoong.farm.dto.out.HorseDetailResponseDto;
import com.e105.majoong.farm.dto.out.HorseSearchResponseDto;
import com.e105.majoong.farm.dto.out.HorseWeeklyReportDetailResponseDto;
import org.springframework.data.domain.Page;

public interface HorseService {
    Page<HorseSearchResponseDto> searchHorses(String horseName, int page, int size);
    HorseDetailResponseDto getHorseDetail(String farmUuid, Long horseNumber, Integer year, Integer month);
    HorseWeeklyReportDetailResponseDto getWeeklyReportDetail(Long horseNumber, Long horseStateId);
}

