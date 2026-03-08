const Post = require("../models/Post");
const logger = require("../utils/logger");

const createPost = async (req, res) => {
  try {
    const { content, mediaIds } = req.body;
    const newlyCreatedPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await newlyCreatedPost.save();
    logger.info("Post created successfully", newlyCreatedPost);
    return res.status(201).json({
      success: true,
      message: "Post created successfully",
    });
  } catch (error) {
    logger.error("Error creating post", error);
    return res.status(500).json({
      success: false,
      message: "Error ocuured while creating the post",
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
  } catch (error) {
    logger.error("Error retrieving post", error);
    return res.status(500).json({
      success: false,
      message: "Error ocuured while retrieving the posts",
    });
  }
};

const getPost = async (req, res) => {
  try {
  } catch (error) {
    logger.error("Error retrieving post", error);
    return res.status(500).json({
      success: false,
      message: "Error ocuured while retrieving the posts",
    });
  }
};

const deletePost = async (req, res) => {
  try {
  } catch (error) {
    logger.error("Error retrieving post", error);
    return res.status(500).json({
      success: false,
      message: "Error ocuured while deleting the post",
    });
  }
};

module.exports = { createPost, getPost, getAllPosts, deletePost };
