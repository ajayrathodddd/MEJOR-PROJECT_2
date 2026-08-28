const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { getPosts, getUserPosts, createPost, addComment, toggleLike, deletePost, savePost, unsavePost, getSavedPosts } = require("../controllers/postController");

router.route("/").get(protect, getPosts).post(protect, upload.single("image"), createPost);
router.route("/user/:id").get(protect, getUserPosts);
router.route("/saved").get(protect, getSavedPosts);
router.route("/:id/comment").post(protect, addComment);
router.route("/:id/like").post(protect, toggleLike);
router.route("/:id/save").post(protect, savePost).delete(protect, unsavePost);
router.route("/:id").delete(protect, deletePost);

module.exports = router;