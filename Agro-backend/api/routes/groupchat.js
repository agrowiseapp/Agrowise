// 1) Imports
const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const GroupChatController = require("../controllers/groupchat");

// 2) Requests Functionality

// [GET] - Get all group chat messages with pagination
// Query params: ?page=1&limit=50
router.get("/", checkAuth, GroupChatController.get_messages);

// [GET] - Get recent messages for initial chat loading
// Query params: ?limit=100
router.get("/recent", checkAuth, GroupChatController.get_recent_messages);

// [POST] - Send new group message
// Body: { message: "text", authorName: "username", userId: "user_id" }
router.post("/", checkAuth, GroupChatController.send_message);

// [POST] - Report a message
// Body: { messageId, reportedUserId, reportedUsername, reason, reportedText, reporterUserId, reporterUsername }
router.post("/report", checkAuth, GroupChatController.report_message);

// [GET] - Get count of pending reported messages (must be before /reports route)
router.get("/reports/count", checkAuth, GroupChatController.get_pending_reports_count);

// [GET] - Get all reported messages for admin review
router.get("/reports", checkAuth, GroupChatController.get_reported_messages);

// [PUT] - Update report status (admin action)
// Params: reportId
// Body: { status: "reviewed|resolved|dismissed", reviewNotes?: "notes", reviewedBy: "adminId" }
router.put("/reports/:reportId", checkAuth, GroupChatController.update_report_status);

// [DELETE] - Delete a message (optional feature)
// Params: messageId
// Body: { userId: "user_id" }
router.delete("/:messageId", checkAuth, GroupChatController.delete_message);

// [DELETE] - Delete a reported message (admin action)
// Params: messageId
// Body: { adminId: "admin_id", reason?: "deletion reason" }
router.delete("/admin/:messageId", checkAuth, GroupChatController.admin_delete_message);

// 3) Export
module.exports = router;