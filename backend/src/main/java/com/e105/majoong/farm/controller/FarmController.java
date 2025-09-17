package com.e105.majoong.farm.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.farm.dto.out.*;
import com.e105.majoong.farm.service.*;
import com.e105.majoong.report.dto.out.MonthlyReportDetailResponseDto;
import com.e105.majoong.report.dto.out.MonthlyReportListResponseDto;
import com.e105.majoong.report.service.MonthlyReportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/farms")
@RequiredArgsConstructor
@Tag(name = "Farm API", description = "농장 관련 API")
public class FarmController {

    private final FarmService farmService;
    private final MonthlyReportService monthlyReportService;
    private final MonthlyDonationService monthlyDonationService;
    private final HorseService horseService;
    private final DonationUsageService donationUsageService;
    private final ScoreService scoreService;

    @GetMapping
    public BaseResponse<Page<FarmListResponseDto>> searchFarms(
            @RequestParam(required = false) String farmName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        String memberUuid = (user != null) ? user.getMemberUuid() : null;

        Page<FarmListResponseDto> result = farmService.searchFarms(farmName, page, size, memberUuid);
        return new BaseResponse<>(result);
    }

    @GetMapping("/{farmUuid}")
    public BaseResponse<FarmDetailResponseDto> getFarmDetail(
            @PathVariable String farmUuid
    ) {
        return new BaseResponse<>(farmService.getFarmDetail(farmUuid));
    }

    @GetMapping("/{farmUuid}/monthly-reports/{reportId}")
    public BaseResponse<MonthlyReportDetailResponseDto> getReportDetail(
            @PathVariable String farmUuid,
            @PathVariable Long reportId
    ) {
        return new BaseResponse<>(monthlyReportService.getReportDetail(farmUuid, reportId));
    }

    @GetMapping("/{farmUuid}/monthly-reports")
    public BaseResponse<List<MonthlyReportListResponseDto>> getReports(
            @PathVariable String farmUuid,
            @RequestParam int year
    ) {
        return new BaseResponse<>(monthlyReportService.getReports(farmUuid, year));
    }

    @GetMapping("/{farmUuid}/donations/usage")
    public DonationUsageResponseDto getDonationUsage(
            @PathVariable String farmUuid,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return monthlyDonationService.getDonationUsage(farmUuid, year, month);
    }

    @GetMapping("/horses")
    public BaseResponse<Page<HorseSearchResponseDto>> searchHorses(
            @RequestParam(required = false) String horseName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<HorseSearchResponseDto> result = horseService.searchHorses(horseName, page, size);
        return new BaseResponse<>(result);
    }

    @GetMapping("/{farmUuid}/donations/usage/last-month")
    public BaseResponse<LastMonthUsageResponseDto> getLastMonthUsage(
            @PathVariable String farmUuid) {
        return new BaseResponse<>(monthlyDonationService.getLastMonthUsage(farmUuid));
    }

    @GetMapping("/{farmUuid}/donations/usage/{usageId}")
    public BaseResponse<UsageDetailResponseDto> getUsageDetail(
            @PathVariable String farmUuid,
            @PathVariable Long usageId
    ) {
        UsageDetailResponseDto result = donationUsageService.getUsageDetail(farmUuid, usageId);
        return new BaseResponse<>(result);
    }

    @GetMapping("/{farmUuid}/scores")
    public BaseResponse<List<ScoreHistoryResponseDto>> getScoreHistory(@PathVariable String farmUuid,  @RequestParam int year) {
        return new BaseResponse<>(scoreService.getScoreHistory(farmUuid, year));
    }

    @GetMapping("/{farmUuid}/horses/{horseNumber}")
    public BaseResponse<HorseDetailResponseDto> getHorseDetail(
            @PathVariable String farmUuid,
            @PathVariable Long horseNumber,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return new BaseResponse<>(horseService.getHorseDetail(farmUuid, horseNumber, year, month));
    }
}

