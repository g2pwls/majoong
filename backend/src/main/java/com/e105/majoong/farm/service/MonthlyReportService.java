package com.e105.majoong.farm.service;

import com.e105.majoong.farm.dto.out.MonthlyReportDetailResponseDto;

public interface MonthlyReportService {
    MonthlyReportDetailResponseDto getReportDetail(String farmUuid, Long reportId);
}