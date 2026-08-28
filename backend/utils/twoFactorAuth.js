const speakeasy = require("speakeasy");

// Generates secret and formatted otpauth URI for QR codes
const generateSecret = () => {
  return speakeasy.generateSecret({
    length: 20,
    name: "Social Media App",
    issuer: "Social Media App",
  });
};

// Verifies token with 30-second time drift window
const verifyToken = (secretBase32, token) => {
  if (!secretBase32 || !token) return false;

  return speakeasy.totp.verify({
    secret: secretBase32,
    encoding: "base32",
    token: String(token).trim(),
    window: 1, // Tolerance window for device clock offset
  });
};

module.exports = { generateSecret, verifyToken };