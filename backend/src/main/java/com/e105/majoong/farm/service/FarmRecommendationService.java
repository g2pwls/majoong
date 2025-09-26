package com.e105.majoong.farm.service;

import com.e105.majoong.farm.dto.out.FarmRecommendResponseDto;
import java.time.YearMonth;
import java.util.List;

public interface FarmRecommendationService {
    List<FarmRecommendResponseDto> recommendFarm(YearMonth yearMonth);
}
