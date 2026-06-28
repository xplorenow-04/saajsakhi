import Redis from "ioredis";

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 1
});

redis.on("error", (err) => {
  console.warn("Redis is offline or failing to connect:", err.message);
});
