package com.e105.majoong.farm.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.farm.dto.out.*;
import com.e105.majoong.farm.service.*;
import com.e105.majoong.report.dto.out.MonthlyReportDetailResponseDto;
import com.e105.majoong.report.dto.out.MonthlyReportListResponseDto;
import com.e105.majoong.report.service.MonthlyReportService;
import com.e105.majoong.score.service.ScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/farms")
@RequiredArgsConstructor
@Tag(name = "Farm API", description = "목장 조회 관련 API")
public class FarmController {

    private final FarmService farmService;
    private final MonthlyReportService monthlyReportService;
    private final MonthlyDonationService monthlyDonationService;
    private final HorseService horseService;
    private final DonationUsageService donationUsageService;
    private final ScoreService scoreService;

    @GetMapping
    @Operation(summary = "목장 키워드로 농장 목록 조회")
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
    @Operation(summary = "목장 상세의 목장 소개 조회")
    public BaseResponse<FarmDetailResponseDto> getFarmDetail(
            @PathVariable String farmUuid
    ) {
        return new BaseResponse<>(farmService.getFarmDetail(farmUuid));
    }

    @GetMapping("/{farmUuid}/monthly-reports/{reportId}")
    @Operation(summary = "목장 상세의 월간 보고서 목록 조회")
    public BaseResponse<MonthlyReportDetailResponseDto> getReportDetail(
            @PathVariable String farmUuid,
            @PathVariable Long reportId
    ) {
        return new BaseResponse<>(monthlyReportService.getReportDetail(farmUuid, reportId));
    }

    @GetMapping("/{farmUuid}/monthly-reports")
    @Operation(summary = "목장 상세의 월간 보고서 상세 조회")
    public BaseResponse<List<MonthlyReportListResponseDto>> getReports(
            @PathVariable String farmUuid,
            @RequestParam(required = false) Integer year
    ) {
        return new BaseResponse<>(monthlyReportService.getReports(farmUuid, year));
    }

    @GetMapping("/{farmUuid}/donations/usage")
    @Operation(summary = "목장 상세의 기부금 사용 내역 목록 조회")
    public DonationUsageResponseDto getDonationUsage(
            @PathVariable String farmUuid,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        return monthlyDonationService.getDonationUsage(farmUuid, year, month);
    }

    @GetMapping("/horses")
    @Operation(summary = "말 키워드로 말 조회")
    public BaseResponse<Page<HorseSearchResponseDto>> searchHorses(
            @RequestParam(required = false) String horseName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<HorseSearchResponseDto> result = horseService.searchHorses(horseName, page, size);
        return new BaseResponse<>(result);
    }

    @GetMapping("/{farmUuid}/donations/usage/last-month")
    @Operation(summary = "목장 상세 기부금 사용 내역의 지난 달 기부금 사용 내역 조회(통계)")
    public BaseResponse<LastMonthUsageResponseDto> getLastMonthUsage(
            @PathVariable String farmUuid) {
        return new BaseResponse<>(monthlyDonationService.getLastMonthUsage(farmUuid));
    }

    @GetMapping("/{farmUuid}/donations/usage/{usageId}")
    @Operation(summary = "기부금 사용 내역 상세 조회")
    public BaseResponse<UsageDetailResponseDto> getUsageDetail(
            @PathVariable String farmUuid,
            @PathVariable Long usageId
    ) {
        UsageDetailResponseDto result = donationUsageService.getUsageDetail(farmUuid, usageId);
        return new BaseResponse<>(result);
    }

    @GetMapping("/{farmUuid}/scores")
    @Operation(summary = "목장 상세의 신뢰도 내역 (통계)")
    public BaseResponse<List<ScoreHistoryAvgResponseDto>> getScoreHistory(
            @PathVariable String farmUuid,
            @RequestParam(required = false) Integer year) {
        return new BaseResponse<>(scoreService.getScoreHistory(farmUuid, year));
    }

    @GetMapping("/{farmUuid}/horses/{horseNumber}")
    @Operation(summary = "말 상세 정보 및 주간 보고서 목록 조회")
    public BaseResponse<HorseDetailResponseDto> getHorseDetail(
            @PathVariable String farmUuid,
            @PathVariable String horseNumber,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        return new BaseResponse<>(horseService.getHorseDetail(farmUuid, horseNumber, year, month));
    }

    @GetMapping("/{farmUuid}/scores/history")
    @Operation(summary = "목장 상세의 신뢰도 내역 목록 조회")
    public BaseResponse<List<ScoreHistoryResponseDto>> getScoreHistory(
            @PathVariable String farmUuid,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        List<ScoreHistoryResponseDto> result = scoreService.getScoreHistory(farmUuid, year, month);
        return new BaseResponse<>(result);
    }

    @GetMapping("horses/{horseNum}/weekly-reports/{horseStateId}")
    @Operation(summary = "말 주간 보고서 상세 조회")
    public BaseResponse<HorseWeeklyReportDetailResponseDto> getWeeklyReportDetail(
            @PathVariable String horseNum,
            @PathVariable Long horseStateId
    ) {
        return new BaseResponse<>(horseService.getWeeklyReportDetail(horseNum, horseStateId));
    }

    @GetMapping("/my-farm")
    @Operation(summary = "내 목장 조회")
    public BaseResponse<FarmDetailResponseDto> getMyFarm(@AuthenticationPrincipal CustomUserDetails user) {
        return new BaseResponse<>(farmService.getMyFarm(user.getMemberUuid()));
    }
}

