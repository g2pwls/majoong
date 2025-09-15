package com.e105.machimnae.common.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    public void set(String key, Object value, long timeout) {
        ValueOperations<String, Object> values = redisTemplate.opsForValue();
        values.set(key, value, timeout, TimeUnit.MILLISECONDS);
    }

    public Object get(String key) {
        ValueOperations<String, Object> values = redisTemplate.opsForValue();
        return values.get(key);
    }

    public void delete(String key) {
        redisTemplate.delete(key);
    }
}