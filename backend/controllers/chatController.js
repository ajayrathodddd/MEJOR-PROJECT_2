const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

const isMember = (chat, userId) =>
  chat.users.some((id) => id.toString() === userId.toString());

const accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  if (userId.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot chat with yourself" });
  }
  if (!(await User.exists({ _id: userId }))) {
    return res.status(404).json({ message: "User not found" });
  }

  let chat = await Conversation.findOne({
    users: { $all: [req.user._id, userId], $size: 2 },
  }).populate("users", "username email profilePicture");

  if (!chat) {
    chat = await Conversation.create({ users: [req.user._id, userId] });
    chat = await chat.populate("users", "username email profilePicture");
  }

  res.json(chat);
};

const getUserChats = async (req, res) => {
  const chats = await Conversation.find({ users: req.user._id })
    .populate("users", "username email profilePicture")
    .sort({ updatedAt: -1 });
  res.json(chats);
};

const getChatMessages = async (req, res) => {
  const chat = await Conversation.findById(req.params.chatId).populate(
    "messages.sender",
    "username profilePicture"
  );
  if (!chat) return res.status(404).json({ message: "Chat not found" });
  if (!isMember(chat, req.user._id)) return res.status(403).json({ message: "Not authorized" });
  res.json(chat.messages);
};

const sendMessage = async (req, res) => {
  const content = req.body.content?.trim();
  if (!content) return res.status(400).json({ message: "Message cannot be empty" });

  const chat = await Conversation.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ message: "Chat not found" });
  if (!isMember(chat, req.user._id)) return res.status(403).json({ message: "Not authorized" });

  chat.messages.push({ sender: req.user._id, content });
  await chat.save();
  await chat.populate("messages.sender", "username profilePicture");
  res.status(201).json(chat);
};

module.exports = { accessChat, sendMessage, getUserChats, getChatMessages };
