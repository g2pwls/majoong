package com.e105.majoong.farm.service;

import com.e105.majoong.common.model.myScore.MyScoreRepository;
import com.e105.majoong.farm.dto.out.ScoreHistoryAvgResponseDto;
import com.e105.majoong.farm.dto.out.ScoreHistoryResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoreServiceImpl implements ScoreService {
    private final MyScoreRepository myScoreRepository;

    @Override
    public List<ScoreHistoryAvgResponseDto> getScoreHistory(String farmUuid, int year) {
        return myScoreRepository.findMonthlyScoreHistory(farmUuid, year);
    }

    @Override
    public List<ScoreHistoryResponseDto> getScoreHistory(String farmUuid, int year, int month) {
        return myScoreRepository.findScoreHistory(farmUuid, year, month);
    }
}