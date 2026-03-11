const Post = require("../models/Post");
const logger = require("../utils/logger");
const redisClient = require("../db/connectToRedis");

const createPost = async (req, res) => {
  try {
    const { error } = req.body;
    if (error) {
      logger.warn("Validation Error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPosts = await redisClient.get(cacheKey);

    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }

    const [posts, totalPosts] = await Promise.all([
      Post.find({})
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit)
        .lean(),
      Post.countDocuments(),
    ]);

    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    };

    // Save in cache
    await redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.status(200).json(result);
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
