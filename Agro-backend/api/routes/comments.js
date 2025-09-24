// 1) Imports
const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const CommentsController = require("../controllers/comments");

// 2) Requests Functionality

// [GET] - Get all posts
router.get("/", CommentsController.comments_get_all);

// [POST] - Create a new product
router.post("/", checkAuth, CommentsController.comments_publish_comment);

// [DELETE] - Delete existing product
router.delete(
  "/:commentId",
  checkAuth,
  CommentsController.comments_delete_comment
);

// [POST] - Reply to a comment
router.post(
  "/reply",
  checkAuth,
  CommentsController.comments_publish_replyComment
);

// [DELETE] - Delete a reply comment
router.delete(
  "/reply/:commentId/:replyId",
  checkAuth,
  CommentsController.comments_delete_replyComment
);

// [PUT] - Report existing comment
router.put(
  "/:commentId",
  checkAuth, // Apply the authentication middleware (if needed)
  CommentsController.comments_report_comment
);

// [PUT] - Report a reply comment
router.put(
  "/reply/:commentId/:replyId",
  checkAuth, // Apply the authentication middleware (if needed)
  CommentsController.comments_report_replyComment
);

// [GET] - Get all posts
router.get("/reported", CommentsController.comments_get_reported);

// 3) Export
module.exports = router;
