// 1) Imports
const mongoose = require("mongoose");

// 2) Create Scheme
const commentsNotificationSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  postId: { type: mongoose.Types.ObjectId, ref: "Post" },
  commentId: { type: mongoose.Types.ObjectId, ref: "Comment" },
  user: { type: mongoose.Types.ObjectId, ref: "User" },
  type: { type: String },
});

// 3) Export
module.exports = mongoose.model(
  "CommentsNotification",
  commentsNotificationSchema
);
