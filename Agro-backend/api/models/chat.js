// 1) Imports
const mongoose = require("mongoose");

// 2) Create Scheme

const chatSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  participants: [String],
  userId: { type: String, required: true },
  user: { type: String, required: true },
  avatar: Number,
  adminRead: Boolean,
  userRead: Boolean,
  lastMessageText: String,
  lastMessageDate: Date,
});

// 3) Export
module.exports = mongoose.model("Chat", chatSchema);
