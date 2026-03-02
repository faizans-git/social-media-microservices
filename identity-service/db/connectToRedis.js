const Redis = require("ioredis");
const logger = require("../src/utils/logger");
const redisClient = new Redis(process.env.REDIS_URL);
redisClient.on("connect", () => {
  logger.info("Redis connected");
});

redisClient.on("error", (err) => {
  logger.warn("Redis error", err);
});

module.exports = redisClient;
