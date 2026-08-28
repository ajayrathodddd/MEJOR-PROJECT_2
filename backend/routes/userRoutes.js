const express = require("express");
const router = express.Router();

const {
	getUserProfile,
	getUserById,
	updateUserProfile,
	searchUsers,
	followUser,
	unfollowUser,
	getFollowers,
	getFollowing,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/profile", protect, getUserProfile);
router.get("/search", protect, searchUsers);
router.post("/profile/upload", protect, upload.single("profilePicture"), updateUserProfile);
router.put("/profile", protect, upload.single("profilePicture"), updateUserProfile);
router.post("/:id/follow", protect, followUser);
router.delete("/:id/follow", protect, unfollowUser);
router.get("/:id/followers", protect, getFollowers);
router.get("/:id/following", protect, getFollowing);
router.get("/:id", protect, getUserById);

module.exports = router;