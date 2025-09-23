package com.e105.majoong.score.service;

import com.e105.majoong.farm.dto.out.ScoreHistoryAvgResponseDto;
import com.e105.majoong.farm.dto.out.ScoreHistoryResponseDto;
import com.e105.majoong.score.dto.in.CreateScoreDto;
import java.util.List;

public interface ScoreService {
    void createMyScore(CreateScoreDto dto);

    List<ScoreHistoryAvgResponseDto> getScoreHistory(String farmUuid, Integer year);

    List<ScoreHistoryResponseDto> getScoreHistory(String farmUuid, Integer year, Integer month);
}
