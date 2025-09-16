package com.e105.majoong.farm.service;

import com.e105.majoong.common.domain.MonthlyReport;
import com.e105.majoong.common.domain.MyScore;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.farm.dto.out.MonthlyReportDetailResponseDto;
import com.e105.majoong.farm.repository.MonthlyReportRepository;
import com.e105.majoong.farm.repository.MyScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MonthlyReportServiceImpl implements MonthlyReportService {

    private final MonthlyReportRepository monthlyReportRepository;
    private final MyScoreRepository myScoreRepository;

    @Override
    public MonthlyReportDetailResponseDto getReportDetail(String farmUuid, Long reportId) {
        MonthlyReport report = monthlyReportRepository.findByIdAndFarmUuid(reportId, farmUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_PRODUCT)); // TODO: 예외 코드 회의 후 수정

        MyScore latestScore = myScoreRepository.findFirstByFarmUuidOrderByYearDescMonthDesc(farmUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_PRODUCT)); // TODO: 예외 코드 회의 후 수정

        return MonthlyReportDetailResponseDto.toDto(report, latestScore);
    }
}
