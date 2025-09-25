package com.e105.majoong.farm.service;

import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.farm.dto.out.FarmRecommendRequestDto;
import java.time.YearMonth;
import java.util.List;

public interface FarmRecommendationService {
    List<FarmRecommendRequestDto> recommendFarm(YearMonth yearMonth);
}
