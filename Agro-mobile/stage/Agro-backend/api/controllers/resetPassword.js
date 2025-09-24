// 1) Imports
const mongoose = require("mongoose");
const User = require("../models/user");
const ResetPassword = require("../models/resetPassword");
const { createResponse } = require("../utils/responseUtils");
const bcrypt = require("bcrypt");

// 2) Controllers - Exports
exports.start_reset_password = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if the user with the given email exists
    const user = await User.findOne({ email });

    if (!user) {
      const response = createResponse("error", 1, "User not found");
      return res.status(404).json(response);
    }

    // Generate a unique 6-digit password
    const newPassword = generateUniquePassword(); // Implement your logic to generate a password

    // Send email to the user with the new password
    await sendEmailWithPassword(email, newPassword); // Implement your email sending logic

    // Save the details to the reset password model
    const resetPassword = new ResetPassword({
      email,
      password: newPassword,
      resetToken: generateResetToken(), // Implement your logic to generate a reset token
      resetTokenExpiry: new Date(),
    });

    await resetPassword.save();

    const response = createResponse("success", 0, "Password reset initiated");
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

exports.admin_reset_password = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if the user with the given email exists
    const user = await User.findOne({ email });

    if (!user) {
      const response = createResponse("error", 1, "Ο Χρήστης δεν βρέθηκε.");
      return res.status(404).json(response);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    const result = await user.save();

    const response = createResponse("success", 0, "Ο Κωδικός έχει αλλάξει!");

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

function generateUniquePassword() {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let newPassword = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    newPassword += characters.charAt(randomIndex);
  }

  return newPassword;
}
