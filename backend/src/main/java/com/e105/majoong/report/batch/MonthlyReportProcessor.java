package com.e105.majoong.report.batch;

import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.horse.Horse;
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
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class MonthlyReportProcessor implements ItemProcessor<Farm, MonthlyReport> {

    private final OpenAiService openAiService;
    @PersistenceContext
    private EntityManager entityManager;

    private static final String DEFAULT_THUMBNAIL = "default_thumbnail_url";

    public MonthlyReportProcessor(OpenAiService openAiService) {
        this.openAiService = openAiService;
    }

    @Override
    public MonthlyReport process(Farm farm) throws Exception {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        LocalDateTime startDateTime = lastMonth.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endDateTime = lastMonth.withDayOfMonth(lastMonth.lengthOfMonth()).atTime(LocalTime.MAX);

        Map<Long, String> horseMap = entityManager.createQuery(
                        "SELECT h FROM Horse h WHERE h.farm.id = :farmId", Horse.class)
                .setParameter("farmId", farm.getId())
                .getResultStream()
                .collect(Collectors.toMap(Horse::getHorseNumber, Horse::getHorseName));

        List<HorseState> horseStates = entityManager.createQuery(
                        "SELECT hs FROM HorseState hs WHERE hs.farmUuid = :farmUuid AND hs.uploadedAt BETWEEN :startDate AND :endDate ORDER BY hs.uploadedAt DESC", HorseState.class)
                .setParameter("farmUuid", farm.getFarmUuid())
                .setParameter("startDate", startDateTime)
                .setParameter("endDate", endDateTime)
                .getResultList();

        // "[말 이름]: [ai_summary]" 형태의 구조적인 문자열로 만듭니다.
        String horseStateContent = horseStates.stream()
                .map(hs -> {
                    String horseName = horseMap.getOrDefault(hs.getHorseNumber(), "이름 없는 말");
                    String summary = hs.getAiSummary();
                    return (summary != null && !summary.isBlank()) ? "말 이름: " + horseName + "\n내용: " + summary : "";
                })
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining("\n---\n"));

        String receiptHistoryContent = entityManager.createQuery(
                        "SELECT rh.aiSummary FROM ReceiptHistory rh WHERE rh.farmUuid = :farmUuid AND rh.createdAt BETWEEN :startDate AND :endDate", String.class)
                .setParameter("farmUuid", farm.getFarmUuid())
                .setParameter("startDate", startDateTime)
                .setParameter("endDate", endDateTime)
                .getResultStream()
                .filter(s -> s != null && !s.isBlank())
                .map(summary -> "기부금 사용 내용: " + summary)
                .collect(Collectors.joining("\n---\n"));

        // 두 종류의 데이터를 구분자를 넣어 하나로 합칩니다.
        String combinedContent = Stream.of(horseStateContent, receiptHistoryContent)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining("\n\n<<<<분석 데이터 구분선>>>>\n\n"));


        if (combinedContent.isEmpty()) {
            return null;
        }

        // AI를 통해 합쳐진 내용을 최종 보고서로 요약
        String finalReportContent = openAiService.analyzeReport(farm.getFarmName(), lastMonth.getYear(), lastMonth.getMonthValue(), combinedContent);

        String thumbnailUrl = horseStates.stream()
                .map(HorseState::getFrontImage)
                .filter(img -> img != null && !img.isBlank())
                .findFirst()
                .orElse(DEFAULT_THUMBNAIL);

        return MonthlyReport.builder()
                .farmUuid(farm.getFarmUuid())
                .memberUuid(farm.getMemberUuid())
                .content(finalReportContent)
                .thumbnail(thumbnailUrl)
                .build();
    }
}