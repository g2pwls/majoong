package com.e105.majoong.report.service;

import com.e105.majoong.common.model.monthlyReport.MonthlyReport;
import com.e105.majoong.common.model.myScore.MyScore;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.report.dto.out.MonthlyReportDetailResponseDto;
import com.e105.majoong.report.dto.out.MonthlyReportListResponseDto;
import com.e105.majoong.report.repository.MonthlyReportRepository;
import com.e105.majoong.common.model.myScore.MyScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_MONTHLY_REPORT));

        MyScore latestScore = myScoreRepository.findFirstByFarmUuidOrderByYearDescMonthDesc(farmUuid)
                .orElse(MyScore.builder()
                        .farmUuid(farmUuid)
                        .year(LocalDate.now().getYear())
                        .month(LocalDate.now().getMonthValue())
                        .score(38.2) // 기본값
                        .build());

        return MonthlyReportDetailResponseDto.toDto(report, latestScore);
    }

    @Override
    public List<MonthlyReportListResponseDto> getReports(String farmUuid, Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        LocalDateTime start = LocalDateTime.of(targetYear, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(targetYear, 12, 31, 23, 59);

        List<MonthlyReport> reports = monthlyReportRepository
                .findByFarmUuidAndCreatedAtBetween(farmUuid, start, end);

        return reports.stream()
                .map(MonthlyReportListResponseDto::toDto)
                .collect(Collectors.toList());
    }
}
