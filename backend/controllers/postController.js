const Post = require("../models/Post");

const getPosts = async (req, res) => {
  const posts = await Post.find()
    .populate("user", "username profilePicture")
    .populate("comments.user", "username profilePicture")
    .sort({ createdAt: -1 });

  res.json(posts);
};

const getUserPosts = async (req, res) => {
  const posts = await Post.find({ user: req.params.id })
    .populate("user", "username profilePicture")
    .populate("comments.user", "username profilePicture")
    .sort({ createdAt: -1 });

  res.json(posts);
};

const createPost = async (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error("Post content is required");
  }

  const post = await Post.create({
    user: req.user._id,
    content: content.trim(),
    image: req.file ? `/uploads/${req.file.filename}` : "",
  });

  const populatedPost = await post.populate("user", "username profilePicture");
  res.status(201).json(populatedPost);
};

const addComment = async (req, res) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error("Comment content is required");
  }

  post.comments.push({ user: req.user._id, content: content.trim() });
  await post.save();

  const populatedPost = await post
    .populate("user", "username profilePicture")
    .populate("comments.user", "username profilePicture");
  res.status(201).json(populatedPost);
};

const toggleLike = async (req, res) => {
  const post = await Post.findById(req.params.id).select("likes");
  if (!post) return res.status(404).json({ message: "Post not found" });

  const userId = req.user._id.toString();
  const liked = post.likes.some((id) => id.toString() === userId);
  const update = liked
    ? { $pull: { likes: req.user._id } }
    : { $addToSet: { likes: req.user._id } };
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, update, {
    new: true,
  }).select("likes");

  res.json({ liked: !liked, likes: updatedPost.likes.length });
};

const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (post.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this post");
  }

  await post.deleteOne();
  res.json({ message: "Post removed" });
};

const savePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  await require("../models/User").findByIdAndUpdate(req.user._id, {
    $addToSet: { savedPosts: post._id },
  });
  res.json({ message: "Post saved", postId: post._id });
};

const unsavePost = async (req, res) => {
  await require("../models/User").findByIdAndUpdate(req.user._id, {
    $pull: { savedPosts: req.params.id },
  });
  res.json({ message: "Post unsaved", postId: req.params.id });
};

const getSavedPosts = async (req, res) => {
  const user = await require("../models/User")
    .findById(req.user._id)
    .populate({
      path: "savedPosts",
      populate: [
        { path: "user", select: "username profilePicture" },
        { path: "comments.user", select: "username profilePicture" },
      ],
    });
  res.json(user?.savedPosts || []);
};

module.exports = {
  getPosts,
  getUserPosts,
  createPost,
  addComment,
  toggleLike,
  deletePost,
  savePost,
  unsavePost,
  getSavedPosts,
};
