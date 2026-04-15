package com.thm.pichub.common.utils;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.github.benmanes.caffeine.cache.Cache;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import javax.annotation.Resource;
import java.io.Serializable;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
@Component
public class MultiLevelCacheUtil {

    @Resource
    private Cache<String, Object> caffeineCache;

    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    private static final long REDIS_TTL = 3600L;

    // ===================== 缓存列表 + 总数（安全可序列化） =====================
    public <T> Page<T> getPageCache(String key, long current, long size, Supplier<Page<T>> dbLoader) {
        // 1. 查本地缓存
        PageCacheData<T> localData = (PageCacheData<T>) caffeineCache.getIfPresent(key);
        if (localData != null) {
            return buildPage(localData, current, size);
        }

        // 2. 查 Redis
        localData = (PageCacheData<T>) redisTemplate.opsForValue().get(key);
        if (localData != null) {
            caffeineCache.put(key, localData);
            return buildPage(localData, current, size);
        }

        // 3. 查数据库
        Page<T> page = dbLoader.get();
        if (page != null) {
            localData = new PageCacheData<>();
            localData.setRecords(page.getRecords());
            localData.setTotal(page.getTotal());

            caffeineCache.put(key, localData);
            redisTemplate.opsForValue().set(key, localData, REDIS_TTL, TimeUnit.SECONDS);
        }

        return page;
    }

    // 清理缓存
    public void clearCache(String key) {
        caffeineCache.invalidate(key);
        redisTemplate.delete(key);
    }

    // 构建 Page 对象（反序列化后不会坏）
    private <T> Page<T> buildPage(PageCacheData<T> data, long current, long size) {
        Page<T> page = new Page<>(current, size, data.getTotal());
        page.setRecords(data.getRecords());
        return page;
    }

    // 安全的分页缓存数据结构
    public static class PageCacheData<T> implements Serializable {
        private List<T> records;
        private long total;

        public List<T> getRecords() { return records; }
        public void setRecords(List<T> records) { this.records = records; }
        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
    }

    public interface CacheLoader {
        Object load();
    }
}