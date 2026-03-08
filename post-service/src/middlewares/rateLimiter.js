const rateLimiter = require("../lib/rateLimiter");
const logger = require("../utils/logger");

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (error) {
    logger.warn(`Rate limit exceeded for ip:${req.ip}`);
    return res
      .status(429)
      .json({ success: false, message: "Too many requests" });
  }
};

module.exports = rateLimiterMiddleware;
