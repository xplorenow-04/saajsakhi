import { redis } from "../redis/config.js";

// Ensure redis client doesn't crash the server on network disconnects
if (redis) {
    redis.on("error", (err) => {
        console.error("Redis Connection Error:", err.message);
    });
}

/**
 * Get cached JSON data by key
 */
export const getCachedData = async (key) => {
    try {
        if (!redis || redis.status !== "ready") {
            return null;
        }
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error(`Redis getCachedData error for key [${key}]:`, err.message);
        return null;
    }
};

/**
 * Set JSON data in cache with a TTL (Time To Live) in seconds
 */
export const setCachedData = async (key, value, ttlSeconds = 3600) => {
    try {
        if (!redis || redis.status !== "ready") {
            return false;
        }
        await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
        return true;
    } catch (err) {
        console.error(`Redis setCachedData error for key [${key}]:`, err.message);
        return false;
    }
};

/**
 * Delete all keys matching a wildcard pattern
 */
export const deleteCachedKeys = async (pattern) => {
    try {
        if (!redis || redis.status !== "ready") {
            return false;
        }
        
        let cursor = "0";
        let deletedCount = 0;
        
        do {
            const reply = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
            cursor = reply[0];
            const keys = reply[1];
            
            if (keys && keys.length > 0) {
                await redis.del(...keys);
                deletedCount += keys.length;
            }
        } while (cursor !== "0");
        
        console.log(`Redis: Invalidated ${deletedCount} cache keys matching pattern [${pattern}]`);
        return true;
    } catch (err) {
        console.error(`Redis deleteCachedKeys error for pattern [${pattern}]:`, err.message);
        return false;
    }
};
