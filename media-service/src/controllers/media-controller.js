const Media = require("../models/Media");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const uploadMedia = async (req, res) => {
  logger.info("Starting media upload");
  try {
    if (!req.file) {
      logger.error("No file present.Please add a file and try again later");
      return res.status(400).json({
        success: false,
        message: "No file present.Please add a file and try again later",
      });
    }

    const { originalName, mimeType, buffer } = req.file;
    const userId = req.user.userId;

    logger.info(`File details name=${originalName}, type=${mimeType}`);
    logger.info("Uploading to cloudinary...........");

    const cloudinaryResult = await uploadMediaToCloudinary(req.file);
    logger.info(
      `Cloudinary upload success Public_id ${cloudinaryResult.public_id}`,
    );

    const newlyCreatedMedia = new Media({
      publicId: cloudinaryResult.public_id,
      originalName,
      mimeType,
      url: cloudinaryResult.secure_url,
      userId,
    });

    await newlyCreatedMedia.save();

    res.status(201).json({
      success: true,
      mediaId: newlyCreatedMedia._id,
      url: newlyCreatedMedia.url,
      message: "Media uploaded successfully",
    });
  } catch (error) {
    logger.error("Error while uploading media", error);
    return res.status(500).json({
      success: false,
      message: "Error ocuured while uploading media",
    });
  }
};

module.exports = { uploadMedia };
