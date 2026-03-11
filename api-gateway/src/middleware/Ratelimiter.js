const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../Db/Redis");
const logger = require("../utils/logger");
const rateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive end point rate limit exceeded for IP: ${req.ip}`);
    res
      .status(429)
      .json({ success: false, message: "Too many requests (gateway)" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

module.exports = { rateLimiter };
