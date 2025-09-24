// 1) Imports
const mongoose = require("mongoose");

// 2) Create Scheme

const messageSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  author: String,
  authorId: String,
  text: String,
  publishedAt: Date,
  chatId: { type: mongoose.Types.ObjectId, ref: "Chat" },
});

// 3) Export
module.exports = mongoose.model("Message", messageSchema);
