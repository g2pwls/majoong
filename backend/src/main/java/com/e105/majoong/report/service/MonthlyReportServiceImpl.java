package com.e105.majoong.report.service;

import com.e105.majoong.common.domain.MonthlyReport;
import com.e105.majoong.common.domain.MyScore;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.report.dto.out.MonthlyReportDetailResponseDto;
import com.e105.majoong.report.dto.out.MonthlyReportListResponseDto;
import com.e105.majoong.report.repository.MonthlyReportRepository;
import com.e105.majoong.farm.repository.MyScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

    @Override
    public List<MonthlyReportListResponseDto> getReports(String farmUuid, int year) {
        LocalDateTime start = LocalDateTime.of(year, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(year, 12, 31, 23, 59);

        List<MonthlyReport> reports = monthlyReportRepository.findByFarmUuidAndCreatedAtBetween(farmUuid, start, end);

        return reports.stream().map(report -> {
            MyScore score = myScoreRepository
                    .findByFarmUuidAndYearAndMonth(
                            farmUuid,
                            report.getCreatedAt().getYear(),
                            report.getCreatedAt().getMonthValue()
                    )
                    .orElseThrow(() -> new RuntimeException("점수 없음"));


            return MonthlyReportListResponseDto.toDto(report, score);
        }).collect(Collectors.toList());
    }
}
