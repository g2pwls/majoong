package com.e105.majoong.batch.report;

import com.e105.majoong.ai.OpenAIService;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.horse.QHorse;
import com.e105.majoong.common.model.horseState.HorseState;
import com.e105.majoong.common.model.horseState.QHorseState;
import com.e105.majoong.common.model.monthlyReport.MonthlyReport;
import com.e105.majoong.common.model.receiptHistory.QReceiptHistory;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
@Slf4j
public class MonthlyReportProcessor implements ItemProcessor<Farm, MonthlyReport> {

    private final OpenAIService openAiService;
    private final JPAQueryFactory queryFactory;

    public MonthlyReportProcessor(OpenAIService openAiService, JPAQueryFactory queryFactory) {
        this.openAiService = openAiService;
        this.queryFactory = queryFactory;
    }

    @Override
    public MonthlyReport process(Farm farm) throws Exception {
        LocalDate lastMonth = LocalDate.now();
        LocalDateTime startDateTime = lastMonth.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endDateTime = lastMonth.withDayOfMonth(lastMonth.lengthOfMonth()).atTime(LocalTime.MAX);

        QHorse horse = QHorse.horse;
        QHorseState horseState = QHorseState.horseState;
        QReceiptHistory receiptHistory = QReceiptHistory.receiptHistory;

        // 말 목록 조회 (HorseNumber -> HorseName 맵핑)
        Map<String, String> horseMap = queryFactory
                .select(horse.horseNumber, horse.horseName)
                .from(horse)
                .where(horse.farm.id.eq(farm.getId()))
                .fetch()
                .stream()
                .collect(Collectors.toMap(
                        tuple -> tuple.get(horse.horseNumber),
                        tuple -> tuple.get(horse.horseName)
                ));

        // HorseState 조회
        List<HorseState> horseStates = queryFactory
                .selectFrom(horseState)
                .where(
                        horseState.farmUuid.eq(farm.getFarmUuid())
                                .and(horseState.uploadedAt.between(startDateTime, endDateTime))
                )
                .orderBy(horseState.uploadedAt.desc())
                .fetch();

        // "[말 이름]: [ai_summary]" 형태의 문자열
        String horseStateContent = horseStates.stream()
                .map(hs -> {
                    String horseName = horseMap.getOrDefault(hs.getHorseNumber(), "이름 없는 말");
                    String summary = hs.getAiSummary();
                    return (summary != null && !summary.isBlank()) ? "말 이름: " + horseName + "\n내용: " + summary : "";
                })
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining("\n---\n"));

        // ReceiptHistory 조회
        List<String> receiptSummaries = queryFactory
                .select(receiptHistory.aiSummary)
                .from(receiptHistory)
                .where(
                        receiptHistory.farmUuid.eq(farm.getFarmUuid())
                                .and(receiptHistory.createdAt.between(startDateTime, endDateTime))
                )
                .fetch();

        String receiptHistoryContent = receiptSummaries.stream()
                .filter(s -> s != null && !s.isBlank())
                .map(summary -> "기부금 사용 내용: " + summary)
                .collect(Collectors.joining("\n---\n"));


        String combinedContent = Stream.of(horseStateContent, receiptHistoryContent)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining("\n\n<<<<분석 데이터 구분선>>>>\n\n"));

        if (combinedContent.isEmpty()) {
            return null;
        }

        return Mono.zip(
                openAiService.analyzeReport(farm.getFarmName(), lastMonth.getYear(), lastMonth.getMonthValue(), combinedContent),
                openAiService.generateThumbnail(combinedContent)
        ).map(tuple -> MonthlyReport.builder()
                .farmUuid(farm.getFarmUuid())
                .memberUuid(farm.getMemberUuid())
                .content(tuple.getT1())
                .thumbnail(tuple.getT2())
                .build()
        ).block(); // 배치니까 최종 block
    }
}