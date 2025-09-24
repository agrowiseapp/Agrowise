// 1) Imports
const mongoose = require("mongoose");

// 2) Create Scheme

const resetPassword = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  email: String,
  password: String,
  resetToken: String, // Store the reset token here
  resetTokenExpiry: Date, // Store the expiry time of the reset token
});

// 3) Export
module.exports = mongoose.model("ResetPassword", resetPassword);
