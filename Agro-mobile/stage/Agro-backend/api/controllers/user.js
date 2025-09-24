// 1) Imports
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Message = require("../models/message");
const Comment = require("../models/comments");
const CommentsNotification = require("../models/commentsNotification");
const Chat = require("../models/chat");
const jwt = require("jsonwebtoken");
const { createResponse } = require("../utils/responseUtils");
require("dotenv").config();

// 2) Requests Functionality

exports.user_signup = async (req, res, next) => {
  try {
    const {
      email,
      phone,
      password,
      firstName,
      lastName,
      gender,
      avatar,
      dateOfBirth,
      isAdmin,
      userLevel,
    } = req.body;

    // Get token from header
    const authAppKey = req.headers.authorization;
    if (authAppKey !== process.env.AUTHAPPKEY) {
      console.log("Error: App is not aithorized");
      const response = createResponse(
        "error",
        1,
        "Η Εφαρμογή δεν έχει επιβεβαιωθεί."
      );
      return res.status(409).json(response);
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() }, // Convert email to lowercase for matching
        //  { phone },
      ],
    });

    if (existingUser) {
      console.log("Error: Phone or email already exists");
      const response = createResponse(
        "error",
        1,
        "Υπάρχει χρήστης με αυτό το τηλέφωνο ή email."
      );
      return res.status(409).json(response);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      email: email.toLowerCase(), // Convert email to lowercase for saving
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      gender,
      avatar,
      dateOfBirth,
      isAdmin,
      userLevel,
    });

    const result = await newUser.save();
    console.log("Result:", result); // Logging

    const response = createResponse("success", 0, "User Created");
    return res.status(201).json(response);
  } catch (error) {
    console.log("Error:", error);

    const response = createResponse("error", 1, null, error.message);
    return res.status(500).json(response);
  }
};

exports.user_login = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();

    const user = await User.findOne({ email: email }).exec();

    if (!user) {
      console.log("User dont found");

      const response = createResponse(
        "error",
        1,
        "Auth failed. Wrong credentials"
      );
      return res.status(401).json(response);
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (isPasswordMatch) {
      console.log("Success Auth");

      const jwtSecret = process.env.JWT_KEY;
      const token = jwt.sign(
        { email: user.email, userId: user._id },
        jwtSecret,
        { expiresIn: "31d" }
      );

      if (req.body.deviceToken && req.body.deviceToken.trim() !== "") {
        user.deviceToken = req.body.deviceToken.trim();
        console.log("Device with token is saved : ", user.deviceToken);
      }

      if (req.body.device) {
        user.device = req.body.device;
        console.log("Device is saved : ", user.device);
      }

      await user.save();

      const response = createResponse("success", 0, "Auth successful", {
        token: token,
      });
      return res.status(200).json(response);
    }

    //console.log("Auth failed");

    const response = createResponse(
      "error",
      1,
      "Auth failed. Wrong credentials"
    );
    return res.status(401).json(response);
  } catch (error) {
    console.log("Error:", error);

    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

exports.user_google_login = async (req, res, next) => {
  try {
    const { idToken, deviceToken } = req.body;

    // Verify the Google ID token
    const { verifyGoogleToken } = require("../utils/googleAuth");
    const verificationResult = await verifyGoogleToken(idToken);

    if (!verificationResult.success) {
      console.log("Google token verification failed");
      const response = createResponse("error", 1, "Invalid Google token");
      return res.status(401).json(response);
    }

    const { googleId, email, firstName, lastName, profilePicture } =
      verificationResult.userInfo;

    // Check if user exists by email or googleId
    let existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { googleId: googleId }],
    }).exec();

    if (!existingUser) {
      console.log("User does not exist, creating new user");

      // Create new user with Google OAuth data
      const newUser = new User({
        _id: new mongoose.Types.ObjectId(),
        email: email.toLowerCase(),
        password: "googleS1gn1n", // Placeholder for Google users
        firstName: firstName,
        lastName: lastName,
        phone: "0000000000", // Default phone for Google users
        gender: null,
        avatar: 1,
        dateOfBirth: "",
        isAdmin: false,
        userLevel: 0,
        googleId: googleId,
        authProvider: "google",
        profilePicture: profilePicture,
      });

      existingUser = await newUser.save();
      console.log("New Google user created:", existingUser);
    } else {
      // Update existing user with Google info if they don't have it
      if (!existingUser.googleId) {
        existingUser.googleId = googleId;
        existingUser.authProvider = "google";
        if (profilePicture) {
          existingUser.profilePicture = profilePicture;
        }
        await existingUser.save();
        console.log("Updated existing user with Google info");
      }
    }

    console.log("Google Auth successful");

    // Generate JWT token
    const jwtSecret = process.env.JWT_KEY;
    const token = jwt.sign(
      { email: existingUser.email, userId: existingUser._id },
      jwtSecret,
      { expiresIn: "31d" }
    );

    // Update device token if provided
    if (deviceToken && deviceToken.trim() !== "") {
      existingUser.deviceToken = deviceToken.trim();
      console.log("Device token saved:", existingUser.deviceToken);
      await existingUser.save();
    }

    const response = createResponse("success", 0, "Google Auth successful", {
      token: token,
    });
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error in Google login:", error);

    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

exports.user_delete = async (req, res, next) => {
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

    // Delete the user
    await User.deleteOne({ _id: userId }).exec();

    const response = createResponse("success", 0, "User deleted");
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);

    const response = createResponse("error", 1, null, error.message);
    return res.status(500).json(response);
  }
};

exports.user_userInfo = async (req, res, next) => {
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

    const user = await User.findOne({ _id: userId }).exec();

    if (!user) {
      console.log("Couldn't find user");

      const response = createResponse("error", 1, "Couldn't find user");
      return res.status(404).json(response);
    }

    const response = createResponse("success", 0, "User info returned", {
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
      userLevel: user.userLevel,
      chatId: user.chatId,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);

    const response = createResponse("error", 1, null, error.message);
    return res.status(500).json(response);
  }
};

exports.user_usersStats = async (req, res, next) => {
  try {
    const users = await User.find({ isAdmin: false })
      .select("_id firstName isAdmin")
      .exec();

    const response = createResponse("success", 0, "User count returned", {
      count: users.length,
    });
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);

    const response = createResponse("error", 1, error.message, error);
    return res.status(500).json(response);
  }
};

exports.user_edit = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId;
    const { email, phone, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({
      _id: userId,
    });

    if (!existingUser) {
      console.log("Error: User not found");
      const response = createResponse("error", 1, "Ο χρήστης δεν βρέθηκε.");
      return res.status(404).json(response);
    }

    // Update user fields
    existingUser.email = email.toLowerCase(); // Convert email to lowercase for saving
    existingUser.phone = phone;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;
    }
    existingUser.firstName = firstName;
    existingUser.lastName = lastName;

    const result = await existingUser.save();

    const response = createResponse(
      "success",
      0,
      "Ο Λογαριασμός έχει ενημερωθεί!"
    );
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);

    let statusCode = 500; // Default status code for internal server error
    let errorCode = 1; // Default error code
    let errorMessage = "An error occurred";

    // Handle specific error cases
    if (error.name === "ValidationError") {
      // Mongoose validation error
      statusCode = 400;
      errorCode = 2;
      errorMessage = "Validation error";
    } else if (error.name === "MongoServerError" && error.code === 11000) {
      // Duplicate key error
      statusCode = 409;
      errorCode = 3;
      const field = Object.keys(error.keyPattern)[0];
      errorMessage = `Το email ή το τηλέφωνο υπάρχονυ ήδη. Παρακαλώ επιλέξτε άλλο.`;
    }

    const response = createResponse(
      "error",
      errorCode,
      errorMessage,
      error.message
    );
    return res.status(statusCode).json(response);
  }
};

exports.user_get_all = async (req, res, next) => {
  try {
    const users = await User.find({}, "-password").exec();

    const response = createResponse(
      "success",
      0,
      "User details returned",
      users
    );
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);

    const response = createResponse("error", 1, null, error.message);
    return res.status(500).json(response);
  }
};

exports.admin_edit = async (req, res, next) => {
  try {
    const { email, userLevel } = req.body;

    const existingUser = await User.findOne({
      email: email,
    });

    if (!existingUser) {
      console.log("Error: User not found");
      const response = createResponse("error", 1, "Ο χρήστης δεν βρέθηκε.");
      return res.status(404).json(response);
    }

    console.log("existingUser.userLevel :", existingUser.userLevel);

    if (existingUser.userLevel !== 1 && existingUser.userLevel !== 2) {
      console.log("Δεν είναι διαχειριστής");
      const response = createResponse(
        "error",
        1,
        "Ο χρήστης δεν είναι διαχειριστής."
      );
      return res.status(404).json(response);
    }

    // Update user fields
    existingUser.userLevel = userLevel;

    const result = await existingUser.save();

    const response = createResponse("success", 0, "Admin Updated");
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);

    let statusCode = 500; // Default status code for internal server error
    let errorCode = 1; // Default error code
    let errorMessage = "An error occurred";

    // Handle specific error cases
    if (error.name === "ValidationError") {
      // Mongoose validation error
      statusCode = 400;
      errorCode = 2;
      errorMessage = "Validation error";
    } else if (error.name === "MongoServerError" && error.code === 11000) {
      // Duplicate key error
      statusCode = 409;
      errorCode = 3;
      const field = Object.keys(error.keyPattern)[0];
      errorMessage = `Το email ή το τηλέφωνο υπάρχονυ ήδη. Παρακαλώ επιλέξτε άλλο.`;
    }

    const response = createResponse(
      "error",
      errorCode,
      errorMessage,
      error.message
    );
    return res.status(statusCode).json(response);
  }
};

exports.deleteUserAndAssociatedRecords = async (req, res, next) => {
  const { email, phone } = req.body;

  try {
    // Find the user based on email and phone
    const existingUser = await User.findOne({ email, phone });

    if (!existingUser) {
      console.log("Error: User not found");
      const response = createResponse("error", 1, "Ο χρήστης δεν βρέθηκε.");
      return res.status(404).json(response);
    }
    const userIdToDelete = existingUser._id;

    // Delete comments
    await Comment.deleteMany({ authorId: userIdToDelete });

    // Delete messages
    await Message.deleteMany({ authorId: userIdToDelete });

    // Delete notifications
    // await Notification.deleteMany({ userId: userIdToDelete });

    // Delete chats and associated messages
    const userChats = await Chat.find({ userId: userIdToDelete });
    for (const chat of userChats) {
      await Message.deleteMany({ chatId: chat._id });
    }
    await Chat.deleteMany({ userId: userIdToDelete });

    // Delete comments notifications
    await CommentsNotification.deleteMany({ user: userIdToDelete });

    // // Delete the user
    await User.findByIdAndDelete(userIdToDelete);

    const response = createResponse(
      "success",
      0,
      "O Χρήστης διαγράφτηκε με επιτυχία"
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);

    const response = createResponse(
      "error",
      1,
      "Προέκυψε σφάλμα κατά την διαγραφή του χρήστη"
    );

    return res.status(500).json(response);
  }
};
