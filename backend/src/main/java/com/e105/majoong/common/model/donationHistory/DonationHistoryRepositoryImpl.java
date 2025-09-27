package com.e105.majoong.common.model.donationHistory;

import com.e105.majoong.common.model.donator.QDonator;
import com.e105.majoong.common.model.farm.QFarm;
import com.e105.majoong.common.model.farmer.QFarmer;
import com.e105.majoong.common.model.settlementHistory.QSettlementHistory;
import com.e105.majoong.mypage.dto.out.DonationHistoryDetailResponseDto;
import com.e105.majoong.mypage.dto.out.DonationHistoryResponseDto;
import com.e105.majoong.mypage.dto.out.DonationResponseDto;
import com.e105.majoong.mypage.dto.out.VaultHistoryResponseDto;
import com.e105.majoong.mypage.dto.out.VaultResponseDto;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import jnr.constants.platform.Local;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

@RequiredArgsConstructor
public class DonationHistoryRepositoryImpl implements DonationHistoryRepositoryCustom {
    private final JPAQueryFactory queryFactory;
    private static final QDonationHistory donationHistory = QDonationHistory.donationHistory;
    private static final QSettlementHistory settlementHistory = QSettlementHistory.settlementHistory;
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
                        donationHistory.id,
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
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        Long result = queryFactory
                .select(donationHistory.donationToken.sum())
                .from(donationHistory)
                .where(
                        donationHistory.farmUuid.eq(farmUuid),
                        donationHistory.donationDate.between(start.atStartOfDay(), end.atTime(23, 59, 59))
                )
                .fetchOne();

        return (result != null) ? result : 0L;
    }

    @Override
    public VaultResponseDto findVaultHistoryByPage(
            String memberUuid, int page, int size, LocalDate startDate, LocalDate endDate) {
        BooleanBuilder donationBuilder = new BooleanBuilder();
        if (startDate != null) {
            donationBuilder.and(donationHistory.donationDate.goe(startDate.atStartOfDay()));
        }

        if (endDate != null) {
            donationBuilder.and(donationHistory.donationDate.lt(endDate.plusDays(1).atStartOfDay()));
        }

        donationBuilder.and(donationHistory.farmerUuid.eq(memberUuid));

        List<VaultHistoryResponseDto> donations = queryFactory
                .select(Projections.constructor(VaultHistoryResponseDto.class,
                        donator.name,
                        donationHistory.donationToken,
                        donationHistory.donationToken.multiply(100),
                        donationHistory.donationDate,
                        donationHistory.txHash,
                        donationHistory.balance,
                        Expressions.constant("DONATION"),
                        Expressions.constant(0L)
                ))
                .from(donationHistory)
                .leftJoin(donator).on(donationHistory.donatorUuid.eq(donator.memberUuid))
                .where(donationBuilder)
                .fetch();

        BooleanBuilder settlementBuilder = new BooleanBuilder();
        if (startDate != null) {
            settlementBuilder.and(settlementHistory.createdAt.goe(startDate.atStartOfDay()));
        }

        if (endDate != null) {
            settlementBuilder.and(settlementHistory.createdAt.lt(endDate.plusDays(1).atStartOfDay()));
        }

        List<VaultHistoryResponseDto> settlements = queryFactory
                .select(Projections.constructor(VaultHistoryResponseDto.class,
                        Expressions.constant("영수증 증빙"),
                        settlementHistory.releasedAmount,
                        settlementHistory.withdrawAmount,
                        settlementHistory.createdAt,
                        settlementHistory.txHash,
                        settlementHistory.balance,
                        Expressions.constant("SETTLEMENT"),
                        settlementHistory.receiptHistoryId
                ))
                .from(settlementHistory)
                .where(settlementBuilder)
                .join(farm).on(settlementHistory.farmUuid.eq(farm.farmUuid))
                .where(farm.memberUuid.eq(memberUuid).and(settlementBuilder))
                .fetch();

        List<VaultHistoryResponseDto> list = new ArrayList<>();
        list.addAll(donations);
        list.addAll(settlements);
        list.sort(Comparator.comparing(VaultHistoryResponseDto::getDonationDate).reversed());

        int pageSize = size;
        int pageIndex = Integer.max(0, page);
        int fromIndex = Math.min(pageIndex * pageSize, list.size());
        int toIndex = Math.min(fromIndex + pageSize, list.size());
        List<VaultHistoryResponseDto> pageList = list.subList(fromIndex, toIndex);

        Page<VaultHistoryResponseDto> history = new PageImpl<>(pageList,
                PageRequest.of(pageIndex, pageSize), list.size());

        Long totalDonation = queryFactory.select(farm.totalDonation)
                .from(farm)
                .where(farm.memberUuid.eq(memberUuid))
                .fetchOne();

        Long usedAmount = queryFactory.select(farm.usedAmount)
                .from(farm)
                .where(farm.memberUuid.eq(memberUuid))
                .fetchOne();

        Long currentBalance = totalDonation - usedAmount;

        return VaultResponseDto.toDto(
                totalDonation, usedAmount, currentBalance, history);
    }

    @Override
    public Map<String, Long> getMonthlyDonationByFarmList(Set<String> farmUuids, YearMonth yearMonth) {
        LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime end = yearMonth.plusMonths(1).atDay(1).atStartOfDay();

        NumberExpression<Long> sumAmount = donationHistory.donationToken.sum();

        List<Tuple> fetch = queryFactory
                .select(donationHistory.farmUuid, sumAmount)
                .from(donationHistory)
                .where(donationHistory.farmUuid.in(farmUuids),
                        donationHistory.donationDate.goe(start),
                        donationHistory.donationDate.lt(end))
                .groupBy(donationHistory.farmUuid)
                .fetch();

        Map<String, Long> result = new HashMap<>(farmUuids.size());
        for (String farUuid : farmUuids) {
            result.put(farUuid, 0L);
        }
        for (Tuple tuple : fetch) {
            String farmUuid = tuple.get(donationHistory.farmUuid);
            Long amount = tuple.get(sumAmount);
            if (amount == null) {
                amount = 0L;
            }
            result.put(farmUuid, amount);
        }

        return result;
    }

    @Override
    public long countAllDonationsByFarm(String farmUuid) {
        return queryFactory
                .select(donationHistory.id.count())
                .from(donationHistory)
                .where(donationHistory.farmUuid.eq(farmUuid))
                .fetchOne();
    }
}