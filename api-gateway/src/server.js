require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimiter } = require("./middleware/Ratelimiter");
const proxy = require("express-http-proxy");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");
const validateToken = require("./middleware/authmiddleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error("Proxy error", err);
    res.status(500).json({
      message: "Internal server error",
      err,
    });
  },
};

app.use(rateLimiter);
app.use(
  "/v1/auth",
  proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["content-type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from identity service : ${proxyRes.statusCode}`,
      );
      return proxyResData;
    },
  }),
);

// setting up proxy for post service
app.use(
  "/v1/post",
  validateToken,
  proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["content-type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from post service : ${proxyRes.statusCode}`,
      );
      return proxyResData;
    },
  }),
);

// setting up proxy for post media service
app.use(
  "/v1/media",
  validateToken,
  proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOptions,

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      return proxyReqOpts;
    },

    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from media service : ${proxyRes.statusCode}`,
      );
      return proxyResData;
    },

    parseReqBody: false, // correct for file uploads
  }),
);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Api Gateway is Runnning on: ${PORT}`);
  logger.info(
    `Identity service Runnning on: ${process.env.IDENTITY_SERVICE_URL}`,
  );
  logger.info(`Post service Runnning on: ${process.env.POST_SERVICE_URL}`);
  logger.info(`Post service Runnning on: ${process.env.MEDIA_SERVICE_URL}`);
});
