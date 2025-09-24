// 1) Imports
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const checkAuth = require("../middleware/check-auth");
const { authLimiter } = require("../middleware/rateLimiter");

// 2) Requests Functionality

// [GET] - Get user details
router.get("/", checkAuth, UserController.user_get_all);

// [POST] - Create a new user
router.post("/signup", UserController.user_signup);

// [POST] - Login a user (with rate limiting)
router.post("/login", authLimiter, UserController.user_login);

// [POST] - Login a user with Google (with rate limiting)
router.post("/loginWithGoogle", authLimiter, UserController.user_google_login);

// [DELETE] - Delete an existint user
router.delete("/delete", checkAuth, UserController.user_delete);

// [POST] - Edit an existint user
router.post("/edit", checkAuth, UserController.user_edit);

// [POST] - Edit an existint user
router.post("/editAdmin", checkAuth, UserController.admin_edit);

// [GET] - Get user details
router.get("/userInfo", checkAuth, UserController.user_userInfo);

// [GET] - Get users number
router.get("/userStats", checkAuth, UserController.user_usersStats);

// [DELETE] - Delete user from admin
router.delete(
  "/deleteUser",
  checkAuth,
  UserController.deleteUserAndAssociatedRecords
);

// 3) Export
module.exports = router;
