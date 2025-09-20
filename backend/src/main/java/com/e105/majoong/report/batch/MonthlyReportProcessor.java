package com.e105.majoong.report.batch;

import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.horseState.HorseState;
import com.e105.majoong.common.model.monthlyReport.MonthlyReport;
import com.e105.majoong.common.model.receiptHistory.ReceiptHistory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class MonthlyReportProcessor implements ItemProcessor<Farm, MonthlyReport> {

    @PersistenceContext
    private EntityManager entityManager;

    private static final String DEFAULT_THUMBNAIL = "default_thumbnail_url";

    @Override
    public MonthlyReport process(Farm farm) throws Exception {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        LocalDateTime startDateTime = lastMonth.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endDateTime = lastMonth.withDayOfMonth(lastMonth.lengthOfMonth()).atTime(LocalTime.MAX);

        // 썸네일을 가져오기 위해 HorseState 객체 전체를 조회 (최신순으로 정렬)
        List<HorseState> horseStates = entityManager.createQuery(
                        "SELECT hs FROM HorseState hs WHERE hs.farmUuid = :farmUuid AND hs.uploadedAt BETWEEN :startDate AND :endDate ORDER BY hs.uploadedAt DESC", HorseState.class)
                .setParameter("farmUuid", farm.getFarmUuid())
                .setParameter("startDate", startDateTime)
                .setParameter("endDate", endDateTime)
                .getResultList();

        List<String> horseStateSummaries = horseStates.stream()
                .map(HorseState::getAiSummary)
                .filter(Objects::nonNull)
                .toList();

        List<String> receiptHistorySummaries = entityManager.createQuery(
                        "SELECT rh.aiSummary FROM ReceiptHistory rh WHERE rh.farmUuid = :farmUuid AND rh.createdAt BETWEEN :startDate AND :endDate", String.class)
                .setParameter("farmUuid", farm.getFarmUuid())
                .setParameter("startDate", startDateTime)
                .setParameter("endDate", endDateTime)
                .getResultList();

        String combinedContent = Stream.concat(
                        horseStateSummaries.stream().filter(s -> !s.isBlank()),
                        receiptHistorySummaries.stream().filter(s -> s != null && !s.isBlank())
                )
                .collect(Collectors.joining("\n\n"));

        // 내용이 없으면 보고서를 생성하지 않음
        if (combinedContent.isEmpty()) {
            return null;
        }

        // 썸네일 결정: 가장 최신 HorseState의 frontImage 사용, 없으면 기본값
        String thumbnailUrl = horseStates.stream()
                .map(HorseState::getFrontImage)
                .filter(img -> img != null && !img.isBlank())
                .findFirst()
                .orElse(DEFAULT_THUMBNAIL);

        return MonthlyReport.builder()
                .farmUuid(farm.getFarmUuid())
                .memberUuid(farm.getMemberUuid())
                .content(combinedContent)
                .thumbnail(thumbnailUrl)
                .build();
    }
}