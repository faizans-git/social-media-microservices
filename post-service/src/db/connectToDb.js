const mongoose = require("mongoose");
const logger = require("../src/utils/logger");
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    logger.info("Connected to Db");
  } catch (error) {
    logger.error("Mongo Db connection error", error);
    process.exit(1);
  }
};

module.exports = connectDB;
