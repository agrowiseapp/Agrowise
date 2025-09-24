// 1) Imports
const mongoose = require("mongoose");

// 2) Create Scheme
const notificationSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  userId: { type: String, required: true },
  chatId: { type: mongoose.Types.ObjectId, required: true },
  message: { type: mongoose.Types.ObjectId, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// 3) Export
module.exports = mongoose.model("Notification", notificationSchema);
