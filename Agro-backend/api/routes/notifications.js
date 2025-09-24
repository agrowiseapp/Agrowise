// 1) Imports
const express = require("express");
const router = express.Router();
const NotificationsController = require("../controllers/notifications");
const checkAuth = require("../middleware/check-auth");

// 2) Requests Functionality

// [GET] - Get user details
router.get(
  "/comments",
  checkAuth,
  NotificationsController.notifications_comments
);

// [GET] - Get notification
router.get("/chat", checkAuth, NotificationsController.notifications_chat);

// 3) Export
module.exports = router;
