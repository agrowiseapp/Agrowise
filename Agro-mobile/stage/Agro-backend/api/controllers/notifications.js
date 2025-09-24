// 1) Imports
const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Chat = require("../models/chat");
const { createResponse } = require("../utils/responseUtils");
const CommentNotification = require("../models/commentsNotification");

// 2) Requests Functionality

exports.notifications_comments = async (req, res, next) => {
  try {
    // Get the user ID from the token
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId;

    // Search for comment notifications for the user
    const notificationCount = await CommentNotification.countDocuments({
      user: userId,
    }).exec();

    // Create the response object
    const response = {
      result: "success",
      resultCode: 0,
      response: { unreadCountSum: notificationCount },
    };

    res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);

    // Create the response object
    const response = {
      result: "error",
      resultCode: 1,
      error: error,
    };

    res.status(500).json(response);
  }
};

exports.notifications_chat = async (req, res) => {
  try {
    let query = {};

    if (req.query.user === "admin") {
      // Get count of chats where adminRead is false
      query = { adminRead: false };
      const chatCount = await Chat.countDocuments(query);

      const response = createResponse(
        "success",
        0,
        "Count of chats with adminRead is false",
        chatCount
      );
      return res.status(200).json(response);
    } else if (req.query.user === "user") {
      // Get token from header
      const token = req.headers.authorization.split(" ")[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_KEY);

      // Get user id from token
      const userId = decoded.userId;

      if (!userId) {
        console.log("Couldn't authorize user");
        const response = createResponse("error", 1, "Couldn't authorize user.");
        return res.status(404).json(response);
      }

      // Check if there is a chat with userId equals to the user's id and userRead is false
      query = { userId: userId, userRead: false };
      const chatExists = await Chat.exists(query);

      console.log("Chat EXISTS :", chatExists);

      const response = createResponse(
        "success",
        0,
        "Chat exists with userId and userRead is false",
        chatExists ? 1 : 0
      );
      return res.status(200).json(response);
    } else {
      console.log("Error:", error);
      const response = createResponse("error", 1, "invalid Parameter");
      return res.status(400).json(response);
    }
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};
