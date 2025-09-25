package com.e105.majoong.common.model.receiptHistory;

import com.e105.majoong.batch.score.receipt.dto.ReceiptCountDto;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
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
    public Map<String, Integer> sumDonationAmountByFarmUuidsBetween(
            List<String> farmUuids, LocalDateTime start, LocalDateTime end) {
        List<Tuple> results = queryFactory.select(receiptHistory.farmUuid, receiptHistory.totalAmount.sum())
                .from(receiptHistory)
                .where(receiptHistory.farmUuid.in(farmUuids).and(receiptHistory.createdAt.between(start, end)))
                .groupBy(receiptHistory.farmUuid)
                .fetch();

        return results.stream()
                .collect(Collectors.toMap(
                        result -> result.get(receiptHistory.farmUuid),
                        result -> Optional.ofNullable(result.get(receiptHistory.totalAmount.sum())).orElse(0)));
    }
}
