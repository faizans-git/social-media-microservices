const logger = require("../utils/logger");
const upload = require("../utils/multerconfig");
const multer = require("multer");

const multerErrorHandler = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      logger.error("Multer error while uploaing", err);

      return res.status(400).json({
        success: false,
        message: "Multer error while uploaing",
        error: err.message,
      });
    } else if (err) {
      logger.error("Unknown error while uploaing", err);

      return res.status(500).json({
        success: false,
        message: "unknown error while uploaing",
        error: err.message,
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file found ",
      });
    }
    next();
  });
};

module.exports = multerErrorHandler;
