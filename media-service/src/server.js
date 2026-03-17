require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./db/connectToDb");
const logger = require("./utils/logger");
const errorHandler = require("./middlewares/errorHandler");
const mediaRoutes = require("./routes/media-routes");
const sensitiveEndpointLimiter = require("./middlewares/sensitiveEndpointLimiter");

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());

app.use(errorHandler);

app.use("/api/media", sensitiveEndpointLimiter, mediaRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  logger.info(`Media service is live at Port: ${PORT}`);
});

connectDB();
