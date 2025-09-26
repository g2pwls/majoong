package com.e105.majoong.farm.util;

import com.e105.majoong.farm.dto.out.RecentStateDto;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FarmCacheUtil {
    private final StringRedisTemplate stringRedisTemplate;
    private static final Duration WINDOW_TTL = Duration.ofHours(48); // 슬라이딩 윈도우
    private static final String F_RECENT = "recentShows";
    private static final String F_LAST = "lastShownAtMs";
    private static final String PREFIX = "farm";
    private static final String SUFFIX = "exposure";

    private String farmKey(String farmUuid) {
        return "%s:%s:%s".formatted(PREFIX, farmUuid, SUFFIX);
    }

    /*
    recentShows: 해당 농장이 최근 얼마나 많이 추천 되었는지
    lastShownAtMs: 마지막으로 추천된 타임스탬프
    -> 최근 너무 많이 노출된 농장은 가중치 낮춤
    */
    public void saveRecentExposure(String farmUuid, int recentShows, long lastShownAtMs) {
        String key = farmKey(farmUuid);
        stringRedisTemplate.opsForHash().put(key, F_RECENT, Integer.toString(recentShows));
        stringRedisTemplate.opsForHash().put(key, F_LAST, Long.toString(lastShownAtMs));
        stringRedisTemplate.expire(key, WINDOW_TTL);
        /*
        Key: farm:123:recent
        Field      Value
        recentShows  5
        lastShownAt  1695532800000
         */
    }

    public Optional<RecentStateDto> getRecentStatus(String farmUuid) {
        String key = farmKey(farmUuid);
        List<Object> list = stringRedisTemplate.opsForHash().multiGet(key, List.of(F_RECENT, F_LAST));
        if (list == null || list.get(0) == null || list.get(1) == null) {
            return Optional.empty();
        }
        try {
            int shows = Integer.parseInt(list.get(0).toString());
            long last = Long.parseLong(list.get(1).toString());
            return Optional.of(RecentStateDto.toDto(shows, last));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    public int updateStatus(String farmUuid, long ms) {
        String key = farmKey(farmUuid);
        /*
          redis 파이프라인 사용
          여러 명령어를 묶어서 서버에 보내고 한번에 처리 -> 속도 최적회
         */
        List<Object> list = stringRedisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            byte[] keyByte = key.getBytes(StandardCharsets.UTF_8);
            /*
              hIncrBy : hash에서 원자적 데이터 증가를 수행하는 명령어
              hSet : hash 데이터를 생성하고 넣어주는 명령어. 한번에 다중 필드와 값을 넣어줄 수 있음
             */
            connection.hIncrBy(keyByte, F_RECENT.getBytes(StandardCharsets.UTF_8), 1);
            connection.hSet(keyByte, F_LAST.getBytes(StandardCharsets.UTF_8),
                    Long.toString(ms).getBytes(StandardCharsets.UTF_8));
            connection.pExpire(keyByte, WINDOW_TTL.toMillis()); //마지막 추천 이후 48시간동안 키가 살아있도록 갱신
            return null;
        });
        Number number = (Number) list.get(0);
        return number.intValue();
    }

    public void ensureInitialized(String farmUuid, long nowMs) {
        String key = farmKey(farmUuid);
        Boolean created = stringRedisTemplate.opsForHash().putIfAbsent(key, F_RECENT, "0");
        if (Boolean.TRUE.equals(created)) { //새로 생성 시 나머지 필드 세팅 및 TTL 적용
            stringRedisTemplate.opsForHash().put(key, F_LAST, Long.toString(nowMs));
            stringRedisTemplate.expire(key, WINDOW_TTL); //48시간 동안 키 유지
        }
    }

}
