package com.e105.majoong.common.model.receiptHistory;

import com.e105.majoong.batch.score.receipt.dto.ReceiptCountDto;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ReceiptHistoryImpl implements ReceiptHistoryCustom {
    private final JPAQueryFactory queryFactory;
    private final QReceiptHistory receiptHistory = QReceiptHistory.receiptHistory;

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
    public List<Object[]> findMonthlyDonationUsed(String farmUuid) {
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
                .map(tuple -> new Object[]{
                        tuple.get(0, Integer.class),
                        tuple.get(1, Integer.class),
                        tuple.get(2, Long.class)
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Object[]> findCategoryStatsLastMonth(String farmUuid, LocalDateTime start, LocalDateTime end) {
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
                .map(tuple -> new Object[]{
                        tuple.get(receiptHistory.categoryId),
                        tuple.get(1, Long.class),
                        tuple.get(2, Long.class)
                })
                .collect(Collectors.toList());
    }

    @Override
    public Object findTotalStatsLastMonth(String farmUuid, LocalDateTime start, LocalDateTime end) {
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

        if (result == null) return null;

        return new Object[]{
                result.get(0, Long.class),   // COUNT
                result.get(1, Long.class)    // SUM
        };
    }
}
