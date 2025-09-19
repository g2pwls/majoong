package com.e105.majoong.report.service;

import com.e105.majoong.report.dto.out.MonthlyReportDetailResponseDto;
import com.e105.majoong.report.dto.out.MonthlyReportListResponseDto;

import java.util.List;

public interface MonthlyReportService {
    MonthlyReportDetailResponseDto getReportDetail(String farmUuid, Long reportId);
    List<MonthlyReportListResponseDto> getReports(String farmUuid, Integer year);
}