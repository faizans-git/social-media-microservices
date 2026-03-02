const express = require("express");
const connectDB = require("../db/connectToDb");
const helmet = require("helmet");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const { rateLimit } = require("express-rate-limit");
const redisClient = require("../db/connectToRedis");
const cors = require("cors");
const logger = require("./utils/logger");
const { RedisStore } = require("rate-limit-redis");
const router = require("./routes/identity-service");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

connectDB();

// for rate limiting n ddos shit
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 5,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for ip:${ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
});

// ip based rate limiting for sensitive pointts
const sensitiveEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive end point rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// apply ip based limiter
app.use("/api/auth/register", sensitiveEndpointLimiter);

app.use("/api/auth", router);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  logger.info(`Indentity service is running at: ${process.env.PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejecttion At", promise, "Reason:", reason);
});
