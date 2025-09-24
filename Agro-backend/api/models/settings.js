// 1) Imports
const mongoose = require("mongoose");

// 2) Create Scheme
const settingsSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  setting_id: { type: Number },
  name: { type: String },
  url: { type: String },
});

// 3) Export
module.exports = mongoose.model("Settings", settingsSchema);
