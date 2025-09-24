// 1) Imports
const mongoose = require("mongoose");

// 2) Create Scheme
const postSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  author: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  post_with_url: { type: String, default: null },
  republished: { type: String, default: null },
  imageUrl: { type: String, default: null }, // Default to null if no image
});

// 3) Export
module.exports = mongoose.model("Post", postSchema);
