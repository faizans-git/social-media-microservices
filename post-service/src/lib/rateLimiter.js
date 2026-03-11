const redisClient = require("../db/connectToRedis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const { RedisStore } = require("rate-limit-redis");

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 100,
  duration: 1,
});

module.exports = rateLimiter;
