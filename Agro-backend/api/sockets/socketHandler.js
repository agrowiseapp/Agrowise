// Socket.IO Handler for Real-time Chat
const jwt = require("jsonwebtoken");

// Store active connections: { userId: socketId }
const activeUsers = new Map();

module.exports = (io) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        console.log("❌ Socket connection rejected: No token provided");
        return next(new Error("Authentication error: No token"));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_KEY);

      // Attach user info to socket
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;

      console.log(`✅ Socket authenticated: User ${decoded.userId}`);
      next();
    } catch (error) {
      console.log("❌ Socket authentication failed:", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`🔌 User connected: ${userId} (Socket: ${socket.id})`);

    // Store active user connection
    activeUsers.set(userId, socket.id);
    console.log(`👥 Active users: ${activeUsers.size}`);

    // ==========================================
    // SINGLE CHAT EVENTS
    // ==========================================

    // Join a specific chat room (for direct/single chat)
    socket.on("join-chat", (chatId) => {
      if (!chatId) {
        console.log("⚠️ Invalid chatId for join-chat");
        return;
      }

      socket.join(`chat-${chatId}`);
      console.log(`💬 User ${userId} joined chat room: ${chatId}`);

      // Notify user they successfully joined
      socket.emit("chat-joined", { chatId, success: true });
    });

    // Leave a specific chat room
    socket.on("leave-chat", (chatId) => {
      if (!chatId) return;

      socket.leave(`chat-${chatId}`);
      console.log(`👋 User ${userId} left chat room: ${chatId}`);
    });

    // ==========================================
    // GROUP CHAT EVENTS
    // ==========================================

    // Join the global group chat room
    socket.on("join-group-chat", () => {
      socket.join("group-chat");
      console.log(`👥 User ${userId} joined group chat`);

      // Notify user they successfully joined
      socket.emit("group-chat-joined", { success: true });
    });

    // Leave the global group chat room
    socket.on("leave-group-chat", () => {
      socket.leave("group-chat");
      console.log(`👋 User ${userId} left group chat`);
    });

    // ==========================================
    // TYPING INDICATORS (Optional Feature)
    // ==========================================

    // User is typing in single chat
    socket.on("typing-single-chat", ({ chatId }) => {
      socket.to(`chat-${chatId}`).emit("user-typing", {
        userId,
        chatId
      });
    });

    // User stopped typing in single chat
    socket.on("stop-typing-single-chat", ({ chatId }) => {
      socket.to(`chat-${chatId}`).emit("user-stop-typing", {
        userId,
        chatId
      });
    });

    // User is typing in group chat
    socket.on("typing-group-chat", () => {
      socket.to("group-chat").emit("user-typing-group", {
        userId
      });
    });

    // User stopped typing in group chat
    socket.on("stop-typing-group-chat", () => {
      socket.to("group-chat").emit("user-stop-typing-group", {
        userId
      });
    });

    // ==========================================
    // DISCONNECT HANDLING
    // ==========================================

    socket.on("disconnect", (reason) => {
      console.log(`🔌 User disconnected: ${userId} (Reason: ${reason})`);

      // Remove from active users
      activeUsers.delete(userId);
      console.log(`👥 Active users: ${activeUsers.size}`);
    });

    // Handle connection errors
    socket.on("error", (error) => {
      console.log(`❌ Socket error for user ${userId}:`, error.message);
    });
  });

  // ==========================================
  // HELPER FUNCTIONS FOR CONTROLLERS
  // ==========================================

  // Export helper functions that controllers can use
  io.emitNewMessage = (chatId, message) => {
    io.to(`chat-${chatId}`).emit("new-message", message);
    console.log(`📨 Emitted new message to chat ${chatId}`);
  };

  io.emitNewGroupMessage = (message) => {
    io.to("group-chat").emit("new-group-message", message);
    console.log(`📨 Emitted new message to group chat`);
  };

  io.emitMessageDeleted = (chatId, messageId) => {
    io.to(`chat-${chatId}`).emit("message-deleted", { messageId });
    console.log(`🗑️ Emitted message deleted to chat ${chatId}`);
  };

  io.emitGroupMessageDeleted = (messageId) => {
    io.to("group-chat").emit("group-message-deleted", { messageId });
    console.log(`🗑️ Emitted message deleted to group chat`);
  };

  io.getActiveUsersCount = () => {
    return activeUsers.size;
  };

  io.isUserOnline = (userId) => {
    return activeUsers.has(userId);
  };

  console.log("✅ Socket handler initialized successfully");
};
