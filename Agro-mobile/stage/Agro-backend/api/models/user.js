// 1) Imports
const mongoose = require("mongoose");

// 2) Create Scheme

const userSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: Number },
  avatar: { type: Number },
  dateOfBirth: { type: String },
  isAdmin: { type: Boolean },
  userLevel: { type: Number },
  chatId: { type: String },
  deviceToken: { type: String },
  device: { type: Number },
  // Google OAuth fields
  googleId: { type: String, unique: true, sparse: true }, // sparse allows null values
  authProvider: { type: String, enum: ["email", "google"], default: "email" },
  profilePicture: { type: String },
});

// 3) Export
module.exports = mongoose.model("User", userSchema);
