package com.e105.majoong.farm.service;

import com.e105.majoong.common.model.myScore.MyScoreRepository;
import com.e105.majoong.farm.dto.out.ScoreHistoryAvgResponseDto;
import com.e105.majoong.farm.dto.out.ScoreHistoryResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoreServiceImpl implements ScoreService {
    private final MyScoreRepository myScoreRepository;

    @Override
    public List<ScoreHistoryAvgResponseDto> getScoreHistory(String farmUuid, Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        return myScoreRepository.findMonthlyScoreHistory(farmUuid, targetYear);
    }

    @Override
    public List<ScoreHistoryResponseDto> getScoreHistory(String farmUuid, Integer year, Integer month) {
        LocalDate now = LocalDate.now();
        int targetYear = (year != null) ? year : now.getYear();

        return myScoreRepository.findScoreHistory(farmUuid, targetYear, month);
    }
}