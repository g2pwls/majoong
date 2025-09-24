package com.e105.majoong.farm.service;

import com.e105.majoong.farm.dto.out.HorseDetailResponseDto;
import com.e105.majoong.farm.dto.out.HorseSearchResponseDto;
import com.e105.majoong.farm.dto.out.HorseWeeklyReportDetailResponseDto;
import org.springframework.data.domain.Page;

public interface HorseService {
    Page<HorseSearchResponseDto> searchHorses(String horseName, int page, int size);
    HorseDetailResponseDto getHorseDetail(String farmUuid, String horseNumber, Integer year, Integer month);
    HorseWeeklyReportDetailResponseDto getWeeklyReportDetail(String horseNumber, Long horseStateId);
}

