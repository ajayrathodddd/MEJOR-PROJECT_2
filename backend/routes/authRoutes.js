const express = require("express");
const router = express.Router();

const {
	signup,
	login,
	enableTwoFactorAuth,
	verifyTwoFactorAuth,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/enable-2fa", protect, enableTwoFactorAuth);
router.post("/verify-2fa", protect, verifyTwoFactorAuth);

module.exports = router;