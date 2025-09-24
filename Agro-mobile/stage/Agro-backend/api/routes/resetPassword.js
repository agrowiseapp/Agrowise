// 1) Imports
const express = require("express");
const router = express.Router();
const ResetPasswordController = require("../controllers/resetPassword");

// 2) Requests Functionality

// [POST] - Create a reset password record
router.post("/", ResetPasswordController.start_reset_password);

// [POST] - Admin change password
router.post(
  "/adminResetPassword",
  ResetPasswordController.admin_reset_password
);

// 3) Export
module.exports = router;
