import { getRedisClient } from '../config/redis.js';
import logger from './logger.js';

// In-memory cache map as ultra-fast L1 cache
const memoryCache = new Map();

export const cache = {
  /**
   * Retrieves an item from cache (L1 Memory or L2 Redis).
   */
  async get(key) {
    // 1. Check in-memory L1 cache
    const memItem = memoryCache.get(key);
    if (memItem) {
      if (Date.now() < memItem.expiresAt) {
        return memItem.value;
      }
      memoryCache.delete(key);
    }

    // 2. Check Redis L2 cache if connected
    const redis = getRedisClient();
    if (redis) {
      try {
        const val = await redis.get(key);
        if (val) {
          // Sync back to L1 for 30s
          memoryCache.set(key, { value: val, expiresAt: Date.now() + 30000 });
          return val;
        }
      } catch (err) {
        logger.warn(`[Cache Error] Redis get failed for ${key}: ${err.message}`);
      }
    }

    return null;
  },

  /**
   * Sets an item in cache with TTL in seconds.
   */
  async set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    memoryCache.set(key, { value, expiresAt });

    const redis = getRedisClient();
    if (redis) {
      try {
        await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
      } catch (err) {
        logger.warn(`[Cache Error] Redis set failed for ${key}: ${err.message}`);
      }
    }
  },

  /**
   * Evicts a key from cache.
   */
  async del(key) {
    memoryCache.delete(key);
    const redis = getRedisClient();
    if (redis) {
      try {
        await redis.del(key);
      } catch (err) {
        logger.warn(`[Cache Error] Redis del failed for ${key}: ${err.message}`);
      }
    }
  },

  /**
   * Cache wrapper for async functions. Returns cached value if available, else executes fn and caches result.
   */
  async wrap(key, ttlSeconds, fetcherFn) {
    const cached = await this.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    const fresh = await fetcherFn();
    if (fresh !== null && fresh !== undefined) {
      await this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  },
};

export default cache;

