package com.e105.majoong.farm.service;

import com.e105.majoong.common.model.receiptHistory.ReceiptHistory;
import com.e105.majoong.common.model.receiptHistory.ReceiptHistoryCustom;
import com.e105.majoong.farm.dto.out.*;
import com.e105.majoong.common.model.receiptHistory.ReceiptHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MonthlyDonationServiceImpl implements MonthlyDonationService {

    private final ReceiptHistoryRepository receiptHistoryRepository;
    private final ReceiptHistoryCustom receiptHistoryCustom;

    @Override
    public DonationUsageResponseDto getDonationUsage(String farmUuid, Integer year, Integer month) {
        LocalDate now = LocalDate.now();
        int targetYear = (year != null) ? year : now.getYear();
        int targetMonth = (month != null) ? month : now.getMonthValue();

        List<MonthlyDonationUsedDto> monthlyDonationUsed = receiptHistoryCustom.findMonthlyDonationUsed(farmUuid);

        LocalDateTime start = LocalDateTime.of(targetYear, targetMonth, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);

        List<ReceiptHistory> receipts =
                receiptHistoryRepository.findByFarmUuidAndCreatedAtBetween(farmUuid, start, end);

        List<ReceiptHistoryResponseDto> receiptHistory = receipts.stream()
                .map(r -> ReceiptHistoryResponseDto.from(r, mapCategory(r.getCategoryId())))
                .toList();

        return new DonationUsageResponseDto(monthlyDonationUsed, receiptHistory);
    }

    @Override
    public LastMonthUsageResponseDto getLastMonthUsage(String farmUuid) {
        LocalDate now = LocalDate.now();
        LocalDate firstDayOfLastMonth = now.minusMonths(1).withDayOfMonth(1);
        LocalDate lastDayOfLastMonth = firstDayOfLastMonth.withDayOfMonth(firstDayOfLastMonth.lengthOfMonth());

        LocalDateTime start = firstDayOfLastMonth.atStartOfDay();
        LocalDateTime end = lastDayOfLastMonth.atTime(LocalTime.MAX);

        TotalStatsDto totalStats = receiptHistoryCustom.findTotalStatsLastMonth(farmUuid, start, end);
        List<CategoryStatsDto> categoryStats = receiptHistoryCustom.findCategoryStatsLastMonth(farmUuid, start, end);

        List<LastMonthUsageDetailDto> details = categoryStats.stream()
                .map(dto -> new LastMonthUsageDetailDto(
                        mapCategory(dto.getCategoryId()),
                        dto.getCount().intValue(),
                        dto.getTotalAmount()
                ))
                .toList();

        return LastMonthUsageResponseDto.toDto(totalStats.getTotalAmount(), totalStats.getTotalCount(), details);
    }



    private String mapCategory(Long categoryId) {
        return switch (categoryId.intValue()) {
            case 1 -> "사료/영양";
            case 2 -> "발굽 관리";
            case 3 -> "의료/건강";
            case 4 -> "시설";
            case 5 -> "운동/재활";
            case 6 -> "수송";
            default -> "기타";
        };
    }
}
