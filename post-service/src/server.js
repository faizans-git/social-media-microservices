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
const { connectToRabbitMQ } = require("./utils/rabbitmq");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(rateLimiterMiddleware);
app.use("/api/post", postRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3002;

async function startServer() {
  try {
    await connectToRabbitMQ();
    app.listen(PORT, () => {
      logger.info(`Indentity service is running at: ${PORT}`);
    });

    connectDB();
  } catch (err) {
    logger.error("Failed to establish connection with server", err);
    process.exit(1);
  }
}
startServer();
