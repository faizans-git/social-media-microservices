const Post = require("../models/Post");
const logger = require("../utils/logger");
const redisClient = require("../db/connectToRedis");
const { invalidatePostCache } = require("../utils/cacheControllers");
const { publishEvent } = require("../utils/rabbitmq");

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

    await invalidatePostCache();

    await publishEvent("post.created", {
      postId: newlyCreatedPost._id.toString(),
      userId: newlyCreatedPost.user.toString(),
      content: newlyCreatedPost.content,
      createdAt: newlyCreatedPost.createdAt,
    });

    logger.info("Post created successfully", newlyCreatedPost);

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
    });
  } catch (error) {
    logger.error("Error creating post", error);

    return res.status(500).json({
      success: false,
      message: "Error ocuured while creating posts",
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
    const postId = req.params.id;
    const cacheKey = `post:${postId}`;

    const cachedPost = await redisClient.get(cacheKey);
    if (cachedPost) {
      return res.json(JSON.parse(cachedPost));
    }

    const singlePostById = await Post.findById(postId);

    if (!singlePostById) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await redisClient.setex(cacheKey, 3600, JSON.stringify(singlePostById));

    res.status(200).json(singlePostById);
  } catch (error) {
    logger.error("Error retrieving post", error);
    return res.status(500).json({
      success: false,
      message: "Error ocuured while retrieving the post",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await Promise.all([
      Post.deleteOne({ _id: post._id }),
      invalidatePostCache(post._id),
      await publishEvent("post.deleted", {
        postId: post._id.toString(),
        userId: req.user.userId,
        mediaIds: post.mediaIds,
      }),
    ]);

    res.json({ message: "post deleted successfully" });
  } catch (error) {
    logger.error("Error retrieving post", error);
    return res.status(500).json({
      success: false,
      message: "Error ocuured while deleting the post",
    });
  }
};

module.exports = { createPost, getPost, getAllPosts, deletePost };
