// 1) Imports
require("dotenv").config();
const express = require("express");
const app = express();

// Trust proxy for Railway deployment - must be before rate limiters
app.set('trust proxy', true);

const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Import rate limiters
const { 
  generalLimiter, 
  authLimiter, 
  uploadLimiter, 
  commentLimiter, 
  passwordResetLimiter 
} = require("./api/middleware/rateLimiter");

// Initialize Routes
const userRoutes = require("./api/routes/user");
const postsRoutes = require("./api/routes/posts");
const commentsRoutes = require("./api/routes/comments");
const notificationsRoutes = require("./api/routes/notifications");
const settingsRoutes = require("./api/routes/settings");
const chatRoutes = require("./api/routes/chat");
const messageRoutes = require("./api/routes/message");
const passwordRoutes = require("./api/routes/resetPassword");
const uploadRoutes = require("./api/routes/upload");
const configRoutes = require("./api/routes/config");
const groupChatRoutes = require("./api/routes/groupchat");

// Conect to Database (MongoDB) with Mongoose
const Atlas_connection_string = process.env.MONGO_CONNECTION_STRING;
mongoose
  .connect(Atlas_connection_string, {
    dbName: process.env.MONGO_DB_NAME || "test",
    retryWrites: true,
    w: "majority",
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Apply to Requests
app.use(morgan("dev")); // Logs for development
app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" })); // Parse Body format better with 10MB limit
app.use(bodyParser.json({ limit: "10mb" })); // Parse Body format better - json with 10MB limit

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Handle CORS Errors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method == "OPTIONS") {
    //console.log("CORS..");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

// Routes to handle requests with specific rate limiting
app.use("/user", userRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentLimiter, commentsRoutes); // Apply comment rate limiting
app.use("/notifications", notificationsRoutes);
app.use("/settings", settingsRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);
app.use("/resetPassword", passwordResetLimiter, passwordRoutes); // Apply password reset rate limiting
app.use("/upload", uploadLimiter, uploadRoutes); // Apply upload rate limiting
app.use("/api/config", configRoutes); // Config endpoint
app.use("/groupchat", groupChatRoutes); // No rate limiting for group chat

// Handle Errors
app.use((req, res, next) => {
  const error = new Error("Route Not found.");
  error.status = 404;
  next(error);
});

// Set up the uncaught exception handler
process.on("uncaughtException", (err) => {
  // Log the error and relevant information
  console.error("**ERROR** - Uncaught Exception:", err);

  // Optionally, perform any necessary cleanup or graceful shutdown

  // Terminate the application
  process.exit(1);
});

// Set up the unhandled promise rejection handler
process.on("unhandledRejection", (reason, promise) => {
  // Log the reason for the unhandled promise rejection
  console.error("**ERROR** - Unhandled Promise Rejection:", reason);

  // Optionally, perform any necessary cleanup or graceful shutdown

  // Terminate the application
  process.exit(1);
});

// Handling all errors (Database or more)
app.use((error, req, res, next) => {
  // Log the error for debugging purposes
  console.error(error);

  // Respond to the client with a structured error message
  res.status(error.status || 500).json({
    error: {
      message: error.message || "Internal Server Error",
    },
  });
});

// Handling all errors (Database or more)
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

// 3) Exports
module.exports = app;
