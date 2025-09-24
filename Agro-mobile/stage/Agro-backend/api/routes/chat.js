// 1) Imports
const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const ChatController = require("../controllers/chat");

// 2) Requests Functionality

// [GET] - Get all Chats
router.get("/", checkAuth, ChatController.chats_all_chats);

// [POST] - Create new chat
router.post("/", checkAuth, ChatController.create_chat);

// [GET] - Get number of chats
router.get("/number", checkAuth, ChatController.chats_get_number);

// [GET] - Get Specific Chat
router.get("/:chatId", checkAuth, ChatController.get_chat_with_messages);

// [POST] - Update Chat with read
router.post("/read", checkAuth, ChatController.chat_read);

// [POST] - Update Chat with read
router.post(
  "/createOrGetChat",
  checkAuth,
  ChatController.admin_create_or_get_Chat
);

// 3) Export
module.exports = router;
