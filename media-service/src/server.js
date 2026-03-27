require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./db/connectToDb");
const logger = require("./utils/logger");
const errorHandler = require("./middlewares/errorHandler");
const mediaRoutes = require("./routes/media-routes");
const sensitiveEndpointLimiter = require("./middlewares/sensitiveEndpointLimiter");
const { consumeEvent, connectToRabbitMQ } = require("./utils/rabbitmq");
const { handlePostDeleted } = require("./eventHandlers/media-event-handlers");

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());

app.use(errorHandler);

app.use("/api/media", sensitiveEndpointLimiter, mediaRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    await connectToRabbitMQ();

    // consume
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Media service is running at: ${PORT}`);
    });

    connectDB();
  } catch (err) {
    logger.error("Failed to establish connection with server", err);
    process.exit(1);
  }
}

startServer();
