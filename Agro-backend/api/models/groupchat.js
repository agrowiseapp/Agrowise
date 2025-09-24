// 1) Imports
const mongoose = require("mongoose");

// 2) Create Schema
const groupChatSchema = mongoose.Schema(
  {
    _id: mongoose.Types.ObjectId,
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000, // Limit message length
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// 3) Create indexes for better query performance
groupChatSchema.index({ date: -1 }); // For sorting messages by date
groupChatSchema.index({ userId: 1 }); // For querying messages by user

// 4) Export
module.exports = mongoose.model("GroupChat", groupChatSchema);