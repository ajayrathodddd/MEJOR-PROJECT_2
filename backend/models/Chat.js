const Post = require("../models/Post");

// @desc    Get user posts
// @route   GET /api/posts/user/:id
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Post content cannot be empty" });
    }

    const post = new Post({
      user: req.user._id,
      content,
      image,
    });

    const createdPost = await post.save();
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserPosts,
  createPost,
};