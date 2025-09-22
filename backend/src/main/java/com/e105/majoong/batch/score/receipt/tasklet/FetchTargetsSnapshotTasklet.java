package com.e105.majoong.batch.score.receipt.tasklet;

//✅ 필수 Tasklet
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
public class FetchTargetsSnapshotTasklet {
}
