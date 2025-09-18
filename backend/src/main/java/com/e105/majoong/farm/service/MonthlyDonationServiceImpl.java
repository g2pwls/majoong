package com.e105.majoong.farm.service;

import com.e105.majoong.common.model.receiptHistory.ReceiptHistory;
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

    @Override
    public DonationUsageResponseDto getDonationUsage(String farmUuid, Integer year, Integer month) {
        LocalDate now = LocalDate.now();
        int targetYear = (year != null) ? year : now.getYear();
        int targetMonth = (month != null) ? month : now.getMonthValue();

        List<Object[]> monthlyRaw = receiptHistoryRepository.findMonthlyDonationUsed(farmUuid);
        List<MonthlyDonationUsedDto> monthlyDonationUsed = monthlyRaw.stream()
                .map(MonthlyDonationUsedDto::from)
                .collect(Collectors.toList());

        LocalDateTime start = LocalDateTime.of(targetYear, targetMonth, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);

        List<ReceiptHistory> receipts = receiptHistoryRepository.findByFarmUuidAndCreatedAtBetween(farmUuid, start, end);

        List<ReceiptHistoryResponseDto> receiptHistory = receipts.stream()
                .map(r -> {
                    String categoryName = mapCategory(r.getCategoryId());
                    return ReceiptHistoryResponseDto.from(r, categoryName);
                })
                .collect(Collectors.toList());

        return new DonationUsageResponseDto(monthlyDonationUsed, receiptHistory);
    }

    @Override
    public LastMonthUsageResponseDto getLastMonthUsage(String farmUuid) {
        LocalDate now = LocalDate.now();
        LocalDate firstDayOfLastMonth = now.minusMonths(1).withDayOfMonth(1);
        LocalDate lastDayOfLastMonth = firstDayOfLastMonth.withDayOfMonth(firstDayOfLastMonth.lengthOfMonth());

        LocalDateTime start = firstDayOfLastMonth.atStartOfDay();
        LocalDateTime end = lastDayOfLastMonth.atTime(LocalTime.MAX);

        Object[] total = (Object[]) receiptHistoryRepository.findTotalStatsLastMonth(farmUuid, start, end);

        int totalCount = total[0] != null ? ((Number) total[0]).intValue() : 0;
        long totalAmount = total[1] != null ? ((Number) total[1]).longValue() : 0L;

        List<Object[]> categoryStats = receiptHistoryRepository.findCategoryStatsLastMonth(farmUuid, start, end);

        List<LastMonthUsageDetailDto> details = categoryStats.stream()
                .map(obj -> new LastMonthUsageDetailDto(
                        mapCategory(obj[0] != null ? ((Number) obj[0]).longValue() : -1L),
                        obj[1] != null ? ((Number) obj[1]).intValue() : 0,
                        obj[2] != null ? ((Number) obj[2]).longValue() : 0L
                ))
                .toList();

        return LastMonthUsageResponseDto.toDto(totalAmount, totalCount, details);
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
