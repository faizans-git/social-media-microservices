const Media = require("../models/Media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const handlePostDeleted = async (event) => {
  const { postId, mediaIds } = event;
  try {
    const mediaToDelete = await media.find({ _id: { $in: mediaIds } });

    for (const media of mediaToDelete) {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);

      logger.info(`Deleted media associatted withh post ${postId}`);
    }

    logger.info(`Processed deletion of media associated with post:${postId}`);
  } catch (error) {
    logger.error("Error occured while media deletion", e);
  }
};
module.exports = { handlePostDeleted };
