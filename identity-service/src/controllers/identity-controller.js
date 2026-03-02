const logger = require("../utils/logger");
const {
  validateRegistration,
  validateLogin,
} = require("../utils/DataValidator");
const generateTokens = require("../utils/generateToken.js");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken.js");

const registerUser = async (req, res) => {
  logger.info(" User Registration endpoint hit");
  try {
    // makes sure data is valid (schema)
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("Validation Error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password, username } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User with these credentials already exists");
      return res.status(400).json({
        success: false,
        message: "User with these credentials already exists",
      });
    }

    user = new User({ username, email, password });
    await user.save();
    logger.warn("User saved successfully", user._id);

    const { accessToken, refreshToken } = await generateTokens(user);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      refreshToken,
      accessToken,
    });
  } catch (error) {
    logger.error("registration error occured", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error ",
    });
  }
};

const loginUser = async (req, res) => {
  logger.info("User login endpoint hit");
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Validation Error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Invalid username or emaiil: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid credentials");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.json({
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (error) {
    logger.error("User login error occured", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const refreshTokenController = async (req, res) => {
  logger.info("RefreshToken endpoint hit");
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing",
      });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid or expired refresh token");

      return res.status(401).json({
        success: false,
        message: `Invalid or expired refresh token`,
      });
    }

    const user = await User.findById(storedToken.user);

    if (!user) {
      logger.warn("User nnot found");

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    await RefreshToken.findByIdAndDelete(storedToken._id);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("An error occured during generating a refresh Token.");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logoutUser = async (req, res) => {
  logger.info("Logout endpoint hit...");
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token is missing",
      });
    }

    await RefreshToken.findOneAndDelete({ token: refreshToken });

    logger.info("Refresh ttoken deleted for logout");

    return res.status(200).json({
      success: true,
      message: "User successfully logged out",
    });
  } catch (error) {
    logger.error("An error occured while logging out.", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokenController,
  logoutUser,
};
