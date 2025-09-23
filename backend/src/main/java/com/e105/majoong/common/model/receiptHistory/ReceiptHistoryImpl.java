package com.e105.majoong.common.model.receiptHistory;

import com.e105.majoong.batch.score.receipt.dto.ReceiptCountDto;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.time.LocalDateTime;
import java.util.List;
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
}
