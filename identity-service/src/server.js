require("dotenv").config();
const express = require("express");
const connectDB = require("../db/connectToDb");
const helmet = require("helmet");
const cors = require("cors");
const logger = require("./utils/logger");
const router = require("./routes/identity-service");
const errorHandler = require("./middleware/errorHandler");
const rateLimiterMiddleware = require("./middleware/rateLimiter");
const sensitiveEndpointLimiter = require("./middleware/sensitiveEndpointLimiter");
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

connectDB();

// for rate limiting n ddos shit

app.use(rateLimiterMiddleware);

// apply ip based limiter for sensitive sht
app.use("/api/auth/register", sensitiveEndpointLimiter);

app.use("/api/auth", router);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  logger.info(`Indentity service is running at: ${process.env.PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejecttion At", promise, "Reason:", reason);
});
