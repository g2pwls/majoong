package com.e105.majoong.farm.service;

import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.farm.util.FarmCacheUtil;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // 30개 이하 - 3, 50개 이하 - 5, 그 이상은 7
public class FarmRecommendationServiceImpl implements FarmRecommendationService {
    private static final double TAU = 0.8; //softmax 온도 파라미터(값이 작을수록 상위 후보에 확률 집중)
    private static final double DECAY = 0.75; //같은 농장이 여러 번 추천될수록 가중치에 0.75곱해져서 노출 확률 줄어듦
    private static final long COOLDOWN_MS = 2 * 60 * 60 * 1000L; // 최즌 추천된 농장은 일정시간동안 다시 추천되지 않음
    private static final double MIN_WEIGHT = 1e-6; //어떤 후보라도 확률이 완전히 0이 되는 걸 방지

    private final FarmCacheUtil farmCacheUtil;
    private final DonationLimitFilterService donationLimitFilterService;


    @Override
    public List<Farm> recommendFarm(List<Farm> farms, YearMonth yearMonth) {
        List<Farm> filterFarms = donationLimitFilterService.filterByDonationLimit(farms, yearMonth);
        if (filterFarms.isEmpty()) {
            return List.of();
        }

        long nowMs = System.currentTimeMillis();
        Map<String, Integer> shows = new HashMap<>(); //최근 추천횟수


        return null;
    }
}
