// 1) Imports
const mongoose = require("mongoose");
const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");
const jwt = require("jsonwebtoken");
const { createResponse } = require("../utils/responseUtils");

// 2) Controllers - Exports

exports.chats_all_chats = async (req, res, next) => {
  try {
    // Fetch all chats
    const chats = await Chat.find()
      .sort({ lastMessageDate: -1 }) // Sorting by createdAt field in descending order
      .populate("participants", "_id email");

    const response = createResponse("success", 0, "Chats fetched", chats);
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

exports.create_chat = async (req, res, next) => {
  try {
    const { userId, user, participants, avatar } = req.body;

    // Create a new chat instance
    const newChat = new Chat({
      _id: new mongoose.Types.ObjectId(),
      participants,
      userId,
      user,
      avatar,
      adminRead: false,
      userRead: false,
      lastMessageText: "",
      lastMessageDate: null,
    });

    // Save the chat to the database
    await newChat.save();

    // Update the chatId in the user document
    const updateUser = await User.findByIdAndUpdate(userId, {
      chatId: newChat._id,
    });

    const response = createResponse("success", 0, "Chat created", newChat._id);
    return res.status(201).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

exports.get_chat_with_messages = async (req, res, next) => {
  try {
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

    const chatId = req.params.chatId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      const response = createResponse("error", 1, "Chat not found");
      return res.status(404).json(response);
    }

    const messages = await Message.find({ chatId })
      .sort({ publishedAt: -1 }) // Sort by publishedAt in ascending order (newest oldest)
      .limit(50); // Limit to top 50 messages

    const formattedMessages = messages.map((message) =>
      formatMessage(message, userId)
    );

    const chatWithMessages = {
      chat,
      messages: formattedMessages,
    };

    const response = createResponse(
      "success",
      0,
      "Chat with messages fetched",
      chatWithMessages
    );
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

exports.chat_read = async (req, res) => {
  const { chatId, userRead, adminRead } = req.body;
  try {
    // Find the chat by chatId
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Update adminRead and userRead fields if provided in the request body
    if (adminRead !== undefined) {
      chat.adminRead = adminRead;
    }

    if (userRead !== undefined) {
      chat.userRead = userRead;
    }

    // Save the updated chat
    await chat.save();

    const response = createResponse(
      "success",
      0,
      "Chat read status updated successfully"
    );
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    const response = createResponse(
      "error",
      1,
      "Chat read status didnt updated successfully"
    );
    return res.status(500).json(response);
  }
};

exports.chats_get_number = async (req, res) => {
  try {
    Chat.find()
      .countDocuments()
      .exec()
      .then((count) => {
        const response = {
          count: count,
          result: "success",
          resultCode: 0,
        };

        res.status(200).json(response);
      })
      .catch((error) => {
        console.log("Error: ", error);

        const response = {
          result: "error",
          resultCode: 1,
          error: error,
        };

        res.status(500).json(response);
      });
  } catch (error) {
    const response = {
      result: "error",
      resultCode: 1,
      error: error,
    };

    res.status(500).json(response);
  }
};

exports.admin_create_or_get_Chat = async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Check if the user already has a chat
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      // User doesn't exist
      const response = createResponse("error", 1, "Ο χρήστης δεν βρέθηκε!");
      return res.status(404).json(response);
    }

    if (existingUser.chatId) {
      // User already has a chat, return the chat information
      const existingChat = await Chat.findById(existingUser.chatId);
      const response = createResponse(
        "success",
        2,
        "Υπάρχει ήδη chat με αυτόν τον χρήστη.",
        existingChat
      );
      return res.status(200).json(response);
    }

    // Create a new chat instance
    const newChat = new Chat({
      _id: new mongoose.Types.ObjectId(),
      participants: [existingUser._id], // You can set the initial participants here
      userId: existingUser._id,
      user: `${existingUser.firstName} ${existingUser.lastName}`,
      avatar: existingUser.avatar || 0, // You can set the default avatar here
      adminRead: false,
      userRead: false,
      lastMessageText: "",
      lastMessageDate: null,
    });

    // Save the chat to the database
    await newChat.save();

    // Update the chatId in the user document
    existingUser.chatId = newChat._id;
    await existingUser.save();

    const response = createResponse(
      "success",
      0,
      "Δημιουργήθηκε νέο chat!",
      newChat
    );
    return res.status(201).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

// 3) Functions
// Function to format a single message
const formatMessage = (message, authenticatedUserId) => ({
  _id: message._id,
  text: message.text,
  createdAt: message.publishedAt,
  user: {
    _id: message.authorId === authenticatedUserId ? 1 : 2,
    name: message.author,
    avatar: message.avatar,
  },
});
