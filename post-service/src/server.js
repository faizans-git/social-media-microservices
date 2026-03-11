require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const postRoutes = require("./routes/post-routes");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./utils/logger");
const connectDB = require("./db/connectToDb");
const sensitiveEndpointLimiter = require("./middlewares/sensitiveEndpointLimiter");
const rateLimiterMiddleware = require("./middlewares/rateLimiter");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(rateLimiterMiddleware);
app.use("/api/post", postRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  logger.info(`Indentity service is running at: ${PORT}`);
});

connectDB();
