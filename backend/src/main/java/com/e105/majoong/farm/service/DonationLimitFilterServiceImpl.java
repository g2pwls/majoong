package com.e105.majoong.farm.service;

import com.e105.majoong.common.model.donationHistory.DonationHistoryRepository;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.common.model.receiptHistory.ReceiptHistoryCustom;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DonationLimitFilterServiceImpl implements DonationLimitFilterService {

    private final ReceiptHistoryCustom receiptHistoryCustom;
    private final FarmRepository farmRepository;

    @Override
    public List<Farm> filterByDonationLimit(List<Farm> farms, YearMonth yearMonth) {
        if (farms.isEmpty()) {
            return List.of();
        }
        List<String> farmUuids = farms.stream().map(Farm::getFarmUuid).toList();
        Map<String, Long> totals = receiptHistoryCustom.sumDonationAmountByFarmUuidsBetween(
                farmUuids,
                yearMonth.atDay(1).atStartOfDay(),
                yearMonth.plusMonths(1).atDay(1).atStartOfDay());
        //이번 달 누적 기부금이 말 수 × 100만을 넘지 않은 농장만 필터링해서 리스트로 반환
        return farms.stream()
                .filter(farm -> totals.getOrDefault(farm.getFarmUuid(), 0L) < (farm.getHorseCount() * 1_000_000L))
                .toList();
    }
}
