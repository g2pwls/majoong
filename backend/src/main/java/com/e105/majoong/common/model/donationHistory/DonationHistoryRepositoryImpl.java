package com.e105.majoong.common.model.donationHistory;

import com.e105.majoong.common.model.donator.QDonator;
import com.e105.majoong.common.model.farm.QFarm;
import com.e105.majoong.common.model.farmer.QFarmer;
import com.e105.majoong.mypage.dto.out.DonationHistoryDetailResponseDto;
import com.e105.majoong.mypage.dto.out.DonationHistoryResponseDto;
import com.e105.majoong.mypage.dto.out.DonationResponseDto;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
public class DonationHistoryRepositoryImpl implements DonationHistoryRepositoryCustom {
    private final JPAQueryFactory queryFactory;
    private static final QDonationHistory donationHistory = QDonationHistory.donationHistory;
    private static final QFarm farm = QFarm.farm;
    private static final QDonator donator = QDonator.donator;
    private static final QFarmer farmer = QFarmer.farmer;

    @Override
    public DonationResponseDto findDonationHistoryByPage(
            String memberUuid, int page, int size, LocalDate startDate, LocalDate endDate
    ) {
        BooleanBuilder builder = new BooleanBuilder();
        if (startDate != null) {
            builder.and(donationHistory.donationDate.goe(startDate.atStartOfDay()));
        }

        if (endDate != null) {
            builder.and(donationHistory.donationDate.lt(endDate.plusDays(1).atStartOfDay()));
        }

        builder.and(donationHistory.donatorUuid.eq(memberUuid));

        int pageSize = size;
        int pageIndex = Integer.max(0, page);
        int offset = pageSize * pageIndex;

        List<DonationHistoryResponseDto> list = queryFactory
                .select(Projections.constructor(DonationHistoryResponseDto.class,
                        donationHistory.farmUuid,
                        donationHistory.donationDate,
                        farm.farmName,
                        donationHistory.donationToken))
                .from(donationHistory)
                .join(farm).on(donationHistory.farmUuid.eq(farm.farmUuid))
                .where(builder)
                .orderBy(donationHistory.donationDate.desc())
                .offset(offset)
                .limit(pageSize)
                .fetch();

        long total = queryFactory
                .select(donationHistory.count())
                .from(donationHistory)
                .join(farm).on(donationHistory.farmUuid.eq(farm.farmUuid))
                .where(builder)
                .fetchOne();

        long totalCount = Optional.ofNullable(total).orElse(0L);

        Page<DonationHistoryResponseDto> history = new PageImpl<>(list, PageRequest.of(
                pageIndex, pageSize), totalCount);

        Long totalCoin = queryFactory
                .select(donationHistory.donationToken.sum())
                .from(donationHistory)
                .where(builder)
                .fetchOne();

        long totalCoinValue = Optional.ofNullable(totalCoin).orElse(0L);

        return DonationResponseDto.toDto(totalCoinValue, history);
    }

    @Override
    public DonationHistoryDetailResponseDto findDonationHistoryDetail(String memberUuid, Long donationHistoryId) {
        return queryFactory
                .select(Projections.constructor(DonationHistoryDetailResponseDto.class,
                        farm.profileImage,
                        donationHistory.donationDate,
                        donator.walletAddress,
                        farmer.walletAddress,
                        donationHistory.donationToken,
                        donationHistory.txHash,
                        farm.farmName))
                .from(donationHistory)
                .join(donator).on(donationHistory.donatorUuid.eq(donator.memberUuid))
                .join(farm).on(donationHistory.farmUuid.eq(farm.farmUuid))
                .join(farmer).on(donationHistory.farmerUuid.eq(farmer.memberUuid))
                .where(donationHistory.id.eq(donationHistoryId)
                        .and(donator.memberUuid.eq(memberUuid)))
                .fetchOne();

    }

    @Override
    public long getMonthlyTotalDonation(String farmUuid, int year, int month) {
        QDonationHistory dh = QDonationHistory.donationHistory;

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        Long result = queryFactory
                .select(dh.donationToken.sum())
                .from(dh)
                .where(
                        dh.farmUuid.eq(farmUuid),
                        dh.donationDate.between(start.atStartOfDay(), end.atTime(23, 59, 59))
                )
                .fetchOne();

        return (result != null) ? result : 0L;
    }
}