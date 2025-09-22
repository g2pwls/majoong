package com.e105.majoong.batch.score.horseState.tasklet;

import com.e105.majoong.batch.score.horseState.dto.HorseInFarmDto;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.common.model.horse.HorseRepositoryCustom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

//✅ 필수 Tasklet
//A) 일일 영수증 Job (dailyReceiptBonusJob)
//
//WindowLockTasklet
//
//입력: targetDate (보통 어제)
//
//역할: [00:00:00.000 ~ 23:59:59.999 KST] 윈도우 계산 + 락 선점(중복 실행 방지)
//
//출력(ExecutionContext): TARGET_DATE, WINDOW_START, WINDOW_END
//
//FetchTargetsSnapshotTasklet
//
//역할: 활성 농장/멤버 스냅샷(현재 체온/기본 38 포함, 필요 범위만) 적재
//
//출력: FARM_SNAPSHOT(farmUuid → {currentTempOr38, …})
//
//AggregateReceiptsTasklet
//
//역할: receipt_history.createdAt ∈ [window] 범위의 영수증 건수 집계(농장/멤버 단위)
//
//출력: DAILY_RECEIPT_CNT(farm/member → count)
//
//CalculateDailyDeltaTasklet
//
//역할: 점수계산 delta = +1 × receiptCnt → newTemp = clamp(base + delta)
//
//출력: DAILY_DELTA(farm → {base, delta, result, detailJson})
//
//PersistTrustTasklet
//
//역할: 점수/체온 반영
//
//trust_temperature_history UPSERT: (farm, date=targetDate, category='DAILY_RECEIPT')
//
//farm.trust_temperature 갱신(0~100 clamp)
//
//(MyScore를 쓰면) my_score에 월 누적 업서트(year, month, category)
//
//출력: 없음(영구 저장)


//B) 주간 말 상태 Job (weeklyHorseStatusJob)
//
//WindowLockTasklet
//
//입력: weekRefDate(월요일)
//
//역할: 직전 금~일 윈도우 계산 + 락 선점
//
//출력: WEEK_START, WEEK_END, WEEK_LABEL(금요일 날짜 등)
//
//FetchWeeklyTargetsSnapshotTasklet                                 0
//
//역할: 일요일 23:59:59 기준 활성 말 스냅샷(농장 → 말 목록/수)
//
//출력: WEEK_HORSE_SNAPSHOT(farm → {horseIds, registeredCount})
//
//AggregateWeeklyHorseStatusUploadsTasklet                          0
//
//역할: upload_log(type='HORSE_STATUS')에서 금~일 distinct(horse_id) 집계
//
//출력: WEEK_UPLOADED(farm → uploadedHorseIds / count)
//
//CalculateWeeklyPenaltyAndBonusTasklet
//
//역할: 전수 보너스/감점 계산
//
//전수면 +5, 아니면 -(미업로드 마리 수) (둘을 동시에 적용하지 않음)
//
//newTemp = clamp(base + delta)
//
//출력: WEEKLY_DELTA(farm → {base, delta, result, detailJson(미업로드 목록 포함)})
//
//PersistTrustTasklet
//
//역할:
//
//trust_temperature_history UPSERT: (farm, date=WEEK_LABEL, category='WEEKLY_HORSE')
//
//farm.trust_temperature 갱신
//
//(MyScore 사용 시) my_score에 월 누적 업서트(weekEnd의 연/월, 카테고리)
@Component
@RequiredArgsConstructor
public class FetchWeeklyTargetsSnapshotTasklet implements Tasklet {

    private final FarmRepository farmRepository;
    private final HorseRepositoryCustom horseRepositoryCustom;
    private final ZoneId KST = ZoneId.of("Asia/Seoul");

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        String weekRefDate = chunkContext.getStepContext().getStepExecution().getJobParameters()
                .getString("weekRefDate");
        if (weekRefDate == null) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_JOB_PARAMETER);
        }
        LocalDate monday = LocalDate.parse(weekRefDate);
        LocalDateTime start = monday.minusDays(3).atStartOfDay(KST).toLocalDateTime();
        LocalDateTime end = monday.minusDays(1)
                .atTime(23, 59, 59, 999_000_000)
                .atZone(KST).toLocalDateTime();

        List<Farm> farms = farmRepository.findAll();
        List<HorseInFarmDto> horseInFarm = horseRepositoryCustom.findActiveHorsesAt(start, end);

        Map<String, Set<Long>> horsesByFarm = new HashMap<>();
        for(Farm farm : farms) {
            horsesByFarm.put(farm.getFarmUuid(), new LinkedHashSet<>());
        }
        for (HorseInFarmDto dto : horseInFarm) {
            horsesByFarm.get(dto.getFarmUuid()).add(dto.getHorseNumber());
        }

        var executeContext = chunkContext.getStepContext().getStepExecution().getExecutionContext();

        executeContext.put("WEEK_HORSE_SNAPSHOT", horsesByFarm);
        executeContext.putString("WEEK_START", start.toString());
        executeContext.putString("WEEK_END", end.toString());
        executeContext.putString("WEEK_LABEL", monday.minusDays(3).toString()); //금요일
        return RepeatStatus.FINISHED;
    }
}
