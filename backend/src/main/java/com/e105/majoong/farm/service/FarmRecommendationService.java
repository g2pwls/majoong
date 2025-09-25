package com.e105.majoong.farm.service;

import com.e105.majoong.common.model.farm.Farm;
import java.time.YearMonth;
import java.util.List;

public interface FarmRecommendationService {
    List<Farm> recommendFarm(List<Farm> farms, YearMonth yearMonth);
}
