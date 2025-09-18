package com.e105.majoong.farm.service;

import com.e105.majoong.farm.dto.out.ScoreHistoryAvgResponseDto;
import com.e105.majoong.farm.dto.out.ScoreHistoryResponseDto;

import java.util.List;

public interface ScoreService {
    List<ScoreHistoryAvgResponseDto> getScoreHistory(String farmUuid, Integer year);

    List<ScoreHistoryResponseDto> getScoreHistory(String farmUuid, Integer year, Integer month);
}
