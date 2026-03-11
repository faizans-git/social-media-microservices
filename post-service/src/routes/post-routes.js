const express = require("express");
const sensitiveEndpointLimiter = require("../middlewares/sensitiveEndpointLimiter");
const {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
} = require("../controllers/post-controller");
const { authenticateRequest } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticateRequest);

router.post("/create-post", sensitiveEndpointLimiter, createPost);
router.get("/all-posts", getAllPosts);
router.get("/post/:id", getPost);
router.delete("/del-post/:id", deletePost);

module.exports = router;
