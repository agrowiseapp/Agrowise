// 1) Imports
const mongoose = require("mongoose");

// 2) Create Scheme
const commentSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  post: { type: mongoose.Types.ObjectId, ref: "Post", required: true },
  authorId: { type: String },
  author: { type: String },
  authorAvatar: Number,
  publishedAt: Date,
  content: String,
  reported: Boolean,
  reportedReason: String,
  replies: [
    {
      _id: mongoose.Types.ObjectId,
      authorId: { type: String },
      author: { type: String },
      authorAvatar: Number,
      publishedAt: Date,
      content: String,
      reported: Boolean,
      reportedReason: String,
    },
  ],
});

// 3) Export
module.exports = mongoose.model("Comments", commentSchema);
