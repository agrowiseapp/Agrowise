// 1) Imports
const mongoose = require("mongoose");
const Chat = require("../models/chat");
const Message = require("../models/message");
const User = require("../models/user");
const { createResponse } = require("../utils/responseUtils");
const sendPushNotification = require("../utils/pushNotification");

// 2) Controllers - Exports
exports.send_message = async (req, res, next) => {
  try {
    const { author, authorId, text, chatId, userType } = req.body;

    // Create a new message instance
    const newMessage = new Message({
      _id: new mongoose.Types.ObjectId(),
      author,
      authorId,
      text,
      publishedAt: new Date(),
      chatId,
    });

    // Save the message to the database
    await newMessage.save();

    // Update the chat associated with the message
    const chat = await Chat.findById(chatId);

    //console.log("I FOUND THE CHAT :", chat);

    chat.lastMessageText = text;
    chat.lastMessageDate = newMessage.publishedAt;

    if (userType === 0) {
      chat.userRead = true;
      chat.adminRead = false;
    } else {
      chat.userRead = false;
      chat.adminRead = true;

      // find user from chat
      const user = await User.findOne({ chatId: chatId });

      //Send notification
      if (user && user.deviceToken && user.device) {
        const notificationTitle = "Νέο μήνυμα";
        const notificationBody =
          "Έλαβες ένα νέο μήνυμα! Ανοιξε την εφαρμογή για να το διαβάσεις.";

        // Send push notification to the user (wrapped in try-catch to not block message sending)
        try {
          await sendPushNotification(
            user.deviceToken,
            notificationTitle,
            notificationBody,
            user.device
          );
          console.log("✅ Push notification sent successfully");
        } catch (notificationError) {
          console.log("⚠️ Push notification failed (message still sent):", notificationError.message);
        }
      }
    }

    // Check if participant already exists in the chat
    if (!chat.participants.includes(authorId)) {
      chat.participants.push(authorId);
    }

    // Save the updated chat to the database
    await chat.save();

    let messageResponse = {
      id: newMessage._id,
      publishedAt: newMessage.publishedAt,
    };

    // Emit real-time message via Socket.IO
    try {
      const io = req.app.get('io');
      if (io && io.emitNewMessage) {
        const socketMessage = {
          _id: newMessage._id,
          text: newMessage.text,
          createdAt: newMessage.publishedAt,
          user: {
            _id: userType === 0 ? 1 : 2, // 1 for user, 2 for admin
            name: author,
          },
        };
        io.emitNewMessage(chatId, socketMessage);
        console.log(`🔌 Real-time message emitted for chat ${chatId}`);
      }
    } catch (socketError) {
      console.log("⚠️ Socket emission failed (non-critical):", socketError.message);
      // Don't fail the request if socket emission fails
    }

    const response = createResponse(
      "success",
      0,
      "Message sent",
      messageResponse
    );
    return res.status(201).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};
