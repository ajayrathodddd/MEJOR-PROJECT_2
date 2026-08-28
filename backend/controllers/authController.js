const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      twoFactorAuth: user.twoFactorAuth,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const enableTwoFactorAuth = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: "SocialMediaApp" });
    req.user.twoFactorAuthSecret = secret.base32;
    req.user.twoFactorAuth = true;
    await req.user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        return res.status(500).json({ message: "Error generating QR code" });
      }
      res.json({ qrCode: data_url, secret: secret.base32 });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyTwoFactorAuth = async (req, res) => {
  try {
    const { token, userId } = req.body;
    const user = await User.findById(userId);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuthSecret,
      encoding: "base32",
      token: token,
    });

    if (verified) {
      res.json({ verified: true, message: "2FA Verified Successfully" });
    } else {
      res.status(400).json({ verified: false, message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signup,
  login,
  enableTwoFactorAuth,
  verifyTwoFactorAuth,
};