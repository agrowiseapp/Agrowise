// 1) Imports
const mongoose = require("mongoose");

// 2) Create Schema
const groupChatBroadcastLogSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupChat",
    required: true,
  },
  broadcastAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  recipientCount: {
    type: Number,
    required: true,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// 3) Create Indexes
// TTL index to automatically delete old logs
groupChatBroadcastLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index on broadcastAt for efficient time-range queries
groupChatBroadcastLogSchema.index({ broadcastAt: 1 });

// 4) Export
module.exports = mongoose.model("GroupChatBroadcastLog", groupChatBroadcastLogSchema);
