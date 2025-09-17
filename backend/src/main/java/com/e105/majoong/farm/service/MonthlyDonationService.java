package com.e105.majoong.farm.service;

import com.e105.majoong.common.model.receiptHistory.ReceiptHistory;
import com.e105.majoong.farm.dto.out.DonationUsageResponseDto;
import com.e105.majoong.farm.dto.out.MonthlyDonationUsedDto;
import com.e105.majoong.farm.dto.out.ReceiptHistoryResponseDto;
import com.e105.majoong.common.model.receiptHistory.ReceiptHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MonthlyDonationService {

    private final ReceiptHistoryRepository receiptHistoryRepository;

    public DonationUsageResponseDto getDonationUsage(String farmUuid, int year, int month) {
        List<Object[]> monthlyRaw = receiptHistoryRepository.findMonthlyDonationUsed(farmUuid);
        List<MonthlyDonationUsedDto> monthlyDonationUsed = monthlyRaw.stream()
                .map(MonthlyDonationUsedDto::from)
                .collect(Collectors.toList());

        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
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
