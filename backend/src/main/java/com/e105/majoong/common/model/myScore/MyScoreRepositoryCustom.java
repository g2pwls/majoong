package com.e105.majoong.common.model.myScore;

import com.e105.majoong.farm.dto.out.ScoreHistoryAvgResponseDto;
import com.e105.majoong.farm.dto.out.ScoreHistoryResponseDto;

import java.util.List;

public interface MyScoreRepositoryCustom {
    List<ScoreHistoryAvgResponseDto> findMonthlyScoreHistory(String farmUuid, Integer year);

    List<ScoreHistoryResponseDto> findScoreHistory(String farmUuid, Integer year, Integer month);
}
