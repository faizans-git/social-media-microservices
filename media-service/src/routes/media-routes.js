const express = require("express");

const { authenticateRequest } = require("../middlewares/authMiddleware");
const multerErrorHandler = require("../middlewares/multerErrorHandler");
const { uploadMedia } = require("../controllers/media-controller");

const router = express.Router();

router.post("/upload", authenticateRequest, multerErrorHandler, uploadMedia);

module.exports = router;
