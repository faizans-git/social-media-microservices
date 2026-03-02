const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokenController,
} = require("../controllers/identity-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshTokenController);

module.exports = router;
