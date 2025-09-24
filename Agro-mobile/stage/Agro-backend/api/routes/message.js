// 1) Imports
const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const MessageController = require("../controllers/message");

// 2) Requests Functionality

// [POST] - send new message
router.post("/", checkAuth, MessageController.send_message);

// 3) Export
module.exports = router;
