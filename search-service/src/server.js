require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./utils/logger");
const connectDB = require("./db/connectToDb");
const rateLimiterMiddleware = require("./middlewares/rateLimiter");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const searchRoutes = require("./routes/search-routes");
const {
  handlePostCreated,
  handlePostDeleted,
} = require("./eventHandlers/search-event-handler");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(rateLimiterMiddleware);
app.use("/api/search", searchRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();

    await consumeEvent("post.created", handlePostCreated);
    await consumeEvent("post.deleted", handlePostDeleted);

    const PORT = process.env.PORT || 3004; // Use whatever port search service runs on
    app.listen(PORT, () => {
      logger.info(`Search service running on port ${PORT}`);
    });

    connectDB();
  } catch (error) {
    logger.error("Error starting the server");
    process.exit(1);
  }
}

startServer();
