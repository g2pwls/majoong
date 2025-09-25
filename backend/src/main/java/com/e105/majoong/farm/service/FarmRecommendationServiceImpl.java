package com.e105.majoong.farm.service;

import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.farm.dto.out.FarmRecommendRequestDto;
import com.e105.majoong.farm.dto.out.RecentStateDto;
import com.e105.majoong.farm.util.FarmCacheUtil;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // 30개 이하 - 3, 50개 이하 - 5, 그 이상은 7
public class FarmRecommendationServiceImpl implements FarmRecommendationService {
    private static final double TAU = 0.8; //softmax 온도 파라미터(값이 작을수록 상위 후보에 확률 집중)
    private static final double DECAY = 0.75; //같은 농장이 여러 번 추천될수록 가중치에 0.75곱해져서 노출 확률 줄어듦
    private static final long COOLDOWN_MS = 2 * 60 * 60 * 1000L; // 최근 추천된 농장은 일정시간동안 다시 추천되지 않음
    private static final double MIN_WEIGHT = 1e-6; //어떤 후보라도 확률이 완전히 0이 되는 걸 방지

    private final FarmCacheUtil farmCacheUtil;
    private final DonationLimitFilterService donationLimitFilterService;
    private final FarmRepository farmRepository;

    @Override
    public List<FarmRecommendRequestDto> recommendFarm(YearMonth yearMonth) {
        List<Farm> farms = farmRepository.findAll();
        //후보 농장 리스트
        List<Farm> filterFarms = donationLimitFilterService.filterByDonationLimit(farms, yearMonth);
        if (filterFarms.isEmpty()) {
            return List.of();
        }

        long totalFarms = farmRepository.count();
        int K;
        if (totalFarms <= 30) {
            K = 3;
        } else if (totalFarms <= 50) {
            K = 5;
        } else {
            K = 7;
        }

        int target = Math.min(K, filterFarms.size());

        long nowMs = System.currentTimeMillis();
        Map<String, Integer> shows = new HashMap<>(filterFarms.size()); //최근 추천횟수
        Map<String, Long> last = new HashMap<>(filterFarms.size()); //마지막 추천 시각

        for (Farm farm : filterFarms) {
            RecentStateDto dto = farmCacheUtil.getRecentStatus(farm.getFarmUuid())
                    .orElse(RecentStateDto.toDto(0, 0L));
            shows.put(farm.getFarmUuid(), dto.getRecentShows());
            last.put(farm.getFarmUuid(), dto.getLastShownAt());
        }

        List<Farm> pool = new ArrayList<>(filterFarms);
        List<FarmRecommendRequestDto> topK = new ArrayList<>(target); //최종 추천될 농장 리스트

        //pool이 비어있지않거나 순차적으로 농장을 뽑을 때까지
        for (int k = 0; k < target && !pool.isEmpty(); k++) {
            final long cutoff = nowMs - COOLDOWN_MS;
            //최근 추천된 농장은 일정 시간동안 제외
            List<Farm> eligible = pool.stream()
                    .filter(farm -> last.getOrDefault(farm.getFarmUuid(), 0L) <= cutoff)
                    .toList();
            if (eligible.isEmpty()) {
                eligible = pool;
            }

            double maxLogit = 0.0; // 후보 농장 점수 중 최대값
            boolean maxInit = false;
            for (Farm farm : eligible) {
                double score = Optional.ofNullable(farm.getTotalScore()).orElse(0.0);
                double logit = score / TAU;
                if (!maxInit || logit > maxLogit) {
                    maxLogit = logit;
                    maxInit = true;
                }
            }

            //모든 score/TAU에서 maxLogit을 빼서 안정화시킴
            double[] weights = new double[eligible.size()];
            double sum = 0.0;
            for (int i = 0; i < eligible.size(); i++) {
                Farm farm = eligible.get(i);
                double score = Optional.ofNullable(farm.getTotalScore()).orElse(0.0);
                double logit = (score / TAU) - maxLogit;
                double w = Math.exp(logit);

                //최근 추천 횟수
                int freq = shows.getOrDefault(farm.getFarmUuid(), 0);
                if (freq > 0) {
                    w *= Math.pow(DECAY, freq);
                }

                //최소 가중치 보장
                w = Math.max(w, MIN_WEIGHT);
                weights[i] = w;
                sum += w;
            }
            //0이면 더 이상 추천할 후보 없음
            if (sum <= 0.0) {
                break;
            }

            //softmax 확률 기반 랜덤 선택
            double r = ThreadLocalRandom.current().nextDouble() * sum;
            int pick = eligible.size() - 1;
            for (int i = 0; i < eligible.size(); i++) {
                //r을 가중치에서 순차적으로 빼면서 0 이하가 되는 순간 선택
                r -= weights[i];
                if (r <= 0.0) {
                    pick = i;
                    break;
                }
            }
            Farm chosenFarm = eligible.get(pick);

            //선택된 농장의 최근 노출 수 1 층가 및 마지막 추천 시간 갱신
            int updatedShows = farmCacheUtil.updateStatus(chosenFarm.getFarmUuid(), nowMs);
            shows.put(chosenFarm.getFarmUuid(), updatedShows);
            last.put(chosenFarm.getFarmUuid(), nowMs);

            //topK 리스트에 추가
            topK.add(FarmRecommendRequestDto.toDto(chosenFarm));
            String chosenFarmUuid = chosenFarm.getFarmUuid();
            //다음 라운드에서 중복 추천되지 않도록 후보군에서 제거
            pool.removeIf(farm -> Objects.equals(farm.getFarmUuid(), chosenFarmUuid));

        }

        return topK;
    }
}
