package com.e105.majoong.common.model.receiptHistory;

import com.e105.majoong.batch.score.receipt.dto.ReceiptCountDto;
import com.e105.majoong.common.model.donationHistory.QDonationHistory;
import com.e105.majoong.farm.dto.out.CategoryStatsDto;
import com.e105.majoong.farm.dto.out.MonthlyDonationUsedDto;
import com.e105.majoong.farm.dto.out.TotalStatsDto;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ReceiptHistoryImpl implements ReceiptHistoryCustom {
    private final JPAQueryFactory queryFactory;
    private final QReceiptHistory receiptHistory = QReceiptHistory.receiptHistory;
    private final QDonationHistory donationHistory = QDonationHistory.donationHistory;
    @Override
    public List<ReceiptCountDto> getReceiptCountByOneDay(LocalDateTime start, LocalDateTime end) {
        return queryFactory
                .select(Projections.constructor(ReceiptCountDto.class,
                        receiptHistory.farmUuid,
                        receiptHistory.id.count()))
                .from(receiptHistory)
                .where(receiptHistory.createdAt.between(start, end))
                .groupBy(receiptHistory.farmUuid)
                .fetch();
    }

    @Override
    public Map<String, Long> sumDonationAmountByFarmUuidsBetween(
            List<String> farmUuids, LocalDateTime start, LocalDateTime end) {
        List<Tuple> results = queryFactory.select(donationHistory.farmUuid, donationHistory.donationToken.sum())
                .from(donationHistory)
                .where(donationHistory.farmUuid.in(farmUuids),
                        donationHistory.donationDate.goe(start),
                        donationHistory.donationDate.lt(end))
                .groupBy(donationHistory.farmUuid)
                .fetch();

        return results.stream()
                .collect(Collectors.toMap(
                        result -> result.get(donationHistory.farmUuid),
                        result -> Optional.ofNullable(result.get(donationHistory.donationToken.sum())).orElse(0L)*100));
        
    }

    public List<MonthlyDonationUsedDto> findMonthlyDonationUsed(String farmUuid) {
        List<Tuple> results = queryFactory
                .select(
                        Expressions.numberTemplate(Integer.class, "YEAR({0})", receiptHistory.createdAt),
                        Expressions.numberTemplate(Integer.class, "MONTH({0})", receiptHistory.createdAt),
                        receiptHistory.totalAmount.sum()
                )
                .from(receiptHistory)
                .where(receiptHistory.farmUuid.eq(farmUuid))
                .groupBy(
                        Expressions.numberTemplate(Integer.class, "YEAR({0})", receiptHistory.createdAt),
                        Expressions.numberTemplate(Integer.class, "MONTH({0})", receiptHistory.createdAt)
                )
                .fetch();

        return results.stream()
                .map(tuple -> MonthlyDonationUsedDto.builder()
                        .year(tuple.get(0, Integer.class))
                        .month(tuple.get(1, Integer.class))
                        .amountSpent(tuple.get(2, Number.class) != null ? tuple.get(2, Number.class).longValue() : 0L)
                        .build())
                .toList();
    }

    @Override
    public List<CategoryStatsDto> findCategoryStatsLastMonth(String farmUuid, LocalDateTime start, LocalDateTime end) {
        List<Tuple> results = queryFactory
                .select(
                        receiptHistory.categoryId,
                        receiptHistory.id.count(),
                        receiptHistory.totalAmount.sum()
                )
                .from(receiptHistory)
                .where(
                        receiptHistory.farmUuid.eq(farmUuid),
                        receiptHistory.createdAt.between(start, end)
                )
                .groupBy(receiptHistory.categoryId)
                .fetch();

        return results.stream()
                .map(tuple -> CategoryStatsDto.builder()
                        .categoryId(tuple.get(receiptHistory.categoryId))
                        .count(tuple.get(1, Number.class) != null ? tuple.get(1, Number.class).longValue() : 0L)
                        .totalAmount(tuple.get(2, Number.class) != null ? tuple.get(2, Number.class).longValue() : 0L)
                        .build())
                .toList();
    }

    @Override
    public TotalStatsDto findTotalStatsLastMonth(String farmUuid, LocalDateTime start, LocalDateTime end) {
        Tuple result = queryFactory
                .select(
                        receiptHistory.id.count(),
                        receiptHistory.totalAmount.sum()
                )
                .from(receiptHistory)
                .where(
                        receiptHistory.farmUuid.eq(farmUuid),
                        receiptHistory.createdAt.between(start, end)
                )
                .fetchOne();

        return TotalStatsDto.builder()
                .totalCount(result != null ? result.get(0, Number.class).intValue() : 0)
                .totalAmount(result != null ? result.get(1, Number.class).longValue() : 0L)
                .build();
    }
}
