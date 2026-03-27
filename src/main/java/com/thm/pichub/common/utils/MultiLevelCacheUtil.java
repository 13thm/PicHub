package com.thm.pichub.common.utils;

import com.github.benmanes.caffeine.cache.Cache;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import javax.annotation.Resource;
import java.util.concurrent.TimeUnit;

@Component
public class MultiLevelCacheUtil {

    @Resource
    private Cache<String, Object> caffeineCache;

    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    private static final long REDIS_TTL = 3600L;

    public Object get(String key, CacheLoader loader) {
        // 1. 查本地缓存
        Object val = caffeineCache.getIfPresent(key);
        if (val != null) return val;

        // 2. 查 Redis
        val = redisTemplate.opsForValue().get(key);
        if (val != null) {
            caffeineCache.put(key, val);
            return val;
        }

        // 3. 查数据库
        val = loader.load();
        if (val != null) {
            caffeineCache.put(key, val);
            redisTemplate.opsForValue().set(key, val, REDIS_TTL, TimeUnit.SECONDS);
        }
        return val;
    }

    public void delete(String key) {
        caffeineCache.invalidate(key);
        redisTemplate.delete(key);
    }

    public interface CacheLoader {
        Object load();
    }
}