import { redis } from "../redis/config.js";
import { logger } from "../utils/logger.js";

class RedisService {
    isAvailable = true;

    constructor() {
        redis.on("error", (err) => {
            this.isAvailable = false;
            logger.error("Redis connection error", { error: err.message });
        });
        redis.on("connect", () => {
            this.isAvailable = true;
            logger.info("Redis connected");
        });
        redis.on("close", () => {
            this.isAvailable = false;
            logger.warn("Redis connection closed");
        });
        redis.on("reconnecting", () => {
            logger.info("Redis reconnecting");
        });
    }

    async get(key) {
        if (!this.isAvailable) return null;
        try {
            const value = await redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.warn("Redis get failed", { key, error: error.message });
            return null;
        }
    }

    async set(key, value, ttlSeconds = 300) {
        if (!this.isAvailable) return;
        try {
            const serialized = JSON.stringify(value);
            await redis.setex(key, ttlSeconds, serialized);
        } catch (error) {
            logger.warn("Redis set failed", { key, error: error.message });
        }
    }

    async del(key) {
        if (!this.isAvailable) return;
        try {
            await redis.del(key);
        } catch (error) {
            logger.warn("Redis del failed", { key, error: error.message });
        }
    }

    async delByPattern(pattern) {
        if (!this.isAvailable) return;
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            logger.warn("Redis delByPattern failed", { pattern, error: error.message });
        }
    }
}

export const redisService = new RedisService();
