// 1) Imports
const mongoose = require("mongoose");
const GroupChat = require("../models/groupchat");
const MessageReport = require("../models/messageReport");
const { createResponse } = require("../utils/responseUtils");

// 2) Message Cleanup Middleware Configuration
const MESSAGE_LIMIT = parseInt(process.env.GROUP_CHAT_MESSAGE_LIMIT) || 200;
const CLEANUP_BATCH_SIZE = parseInt(process.env.GROUP_CHAT_CLEANUP_BATCH_SIZE) || 50;

const cleanupOldMessages = async () => {
  try {
    // Get total message count
    const totalMessages = await GroupChat.countDocuments();
    
    if (totalMessages >= MESSAGE_LIMIT) {
      console.log(`🧹 Group Chat Cleanup: Message limit reached (${totalMessages}/${MESSAGE_LIMIT}). Starting cleanup...`);
      
      // Get the oldest messages to delete
      const messagesToDelete = await GroupChat.find()
        .sort({ date: 1 }) // Oldest first
        .limit(CLEANUP_BATCH_SIZE)
        .select('_id date')
        .exec();
      
      if (messagesToDelete.length > 0) {
        const messageIds = messagesToDelete.map(msg => msg._id);
        const oldestDate = messagesToDelete[0].date;
        const newestDeletedDate = messagesToDelete[messagesToDelete.length - 1].date;
        
        // Delete related reports first (to maintain referential integrity)
        const deletedReports = await MessageReport.deleteMany({
          messageId: { $in: messageIds }
        });
        
        // Delete the old messages
        const deleteResult = await GroupChat.deleteMany({
          _id: { $in: messageIds }
        });
        
        console.log(`✅ Cleanup completed: Deleted ${deleteResult.deletedCount} messages (${oldestDate.toISOString()} to ${newestDeletedDate.toISOString()}) and ${deletedReports.deletedCount} related reports`);
        
        // Final count verification
        const remainingMessages = await GroupChat.countDocuments();
        console.log(`📊 Messages after cleanup: ${remainingMessages}/${MESSAGE_LIMIT}`);
      }
    } else {
      // Optional: Log when cleanup is not needed (can be commented out in production)
      console.log(`✅ Group Chat: Message count (${totalMessages}/${MESSAGE_LIMIT}) - No cleanup needed`);
    }
  } catch (error) {
    console.error('❌ Error during message cleanup:', error);
    // Don't throw error to prevent disrupting the main message sending flow
  }
};

// 3) Controllers - Exports

// Get all group chat messages with pagination
exports.get_messages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Get messages sorted by date (newest first) with pagination
    const messages = await GroupChat.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "firstName lastName") // Populate user info if needed
      .exec();

    // Get total count for pagination info
    const totalMessages = await GroupChat.countDocuments();

    const response = createResponse(
      "success",
      0,
      "Messages retrieved successfully",
      {
        messages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasNextPage: page < Math.ceil(totalMessages / limit),
          hasPrevPage: page > 1,
        },
      }
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

// Get recent messages (for initial chat loading)
exports.get_recent_messages = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    // Get recent messages sorted by date (newest first)
    const messages = await GroupChat.find()
      .sort({ date: -1 })
      .limit(limit)
      .populate("userId", "firstName lastName")
      .exec();

    const response = createResponse(
      "success",
      0,
      "Recent messages retrieved successfully",
      { messages }
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

// Send a new group message
exports.send_message = async (req, res, next) => {
  try {
    const { message, authorName, userId } = req.body;

    // Validate required fields
    if (!message || !authorName || !userId) {
      const response = createResponse(
        "error",
        1,
        "Missing required fields: message, authorName, userId"
      );
      return res.status(400).json(response);
    }

    // Validate message length
    if (message.trim().length === 0) {
      const response = createResponse("error", 1, "Message cannot be empty");
      return res.status(400).json(response);
    }

    if (message.length > 1000) {
      const response = createResponse(
        "error",
        1,
        "Message too long (max 1000 characters)"
      );
      return res.status(400).json(response);
    }

    // Create new group message
    const newMessage = new GroupChat({
      _id: new mongoose.Types.ObjectId(),
      message: message.trim(),
      authorName: authorName.trim(),
      userId: userId,
      date: new Date(),
    });

    // Save message to database
    const savedMessage = await newMessage.save();

    // Run cleanup after saving the new message (async, non-blocking)
    cleanupOldMessages().catch(error => {
      console.error('Background cleanup failed:', error);
    });

    // Send push notifications asynchronously (non-blocking)
    const sendNotifications = async () => {
      try {
        const { sendGroupChatNotifications } = require("../utils/groupChatNotifications");
        const result = await sendGroupChatNotifications(
          savedMessage.message,
          savedMessage._id,
          savedMessage.userId,
          savedMessage.authorName
        );

        if (result.skipped === 'rate_limited') {
          console.log('⏭️ Group Chat: Notifications skipped due to rate limiting');
        } else if (result.skipped === 'disabled') {
          console.log('⚠️ Group Chat: Notifications disabled');
        } else if (result.error) {
          console.error(`❌ Group Chat: Notification error - ${result.error}`);
        } else {
          console.log(`✅ Group Chat: ${result.sent} notifications sent successfully`);
        }
      } catch (error) {
        console.error("❌ Group Chat: Unexpected notification error:", error.message);
      }
    };

    // Fire and forget - don't block the response
    sendNotifications();

    // Populate user info for response
    await savedMessage.populate("userId", "firstName lastName");

    const messageResponse = {
      id: savedMessage._id,
      message: savedMessage.message,
      authorName: savedMessage.authorName,
      userId: savedMessage.userId,
      date: savedMessage.date,
      createdAt: savedMessage.createdAt,
    };

    const response = createResponse(
      "success",
      0,
      "Message sent successfully",
      messageResponse
    );

    return res.status(201).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

// Delete a message (optional - for message management)
exports.delete_message = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    // Find the message
    const message = await GroupChat.findById(messageId);

    if (!message) {
      const response = createResponse("error", 1, "Message not found");
      return res.status(404).json(response);
    }

    // Check if user owns the message (optional security check)
    if (message.userId.toString() !== userId) {
      const response = createResponse(
        "error",
        1,
        "You can only delete your own messages"
      );
      return res.status(403).json(response);
    }

    // Delete the message
    await GroupChat.findByIdAndDelete(messageId);

    const response = createResponse(
      "success",
      0,
      "Message deleted successfully"
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

// Report a message
exports.report_message = async (req, res, next) => {
  try {
    const {
      messageId,
      reportedUserId,
      reportedUsername,
      reason,
      reportedText,
      reporterUserId,
      reporterUsername,
    } = req.body;

    // Validate required fields
    if (
      !messageId ||
      !reportedUserId ||
      !reportedUsername ||
      !reason ||
      !reportedText ||
      !reporterUserId ||
      !reporterUsername
    ) {
      const response = createResponse(
        "error",
        1,
        "Missing required fields for message report"
      );
      return res.status(400).json(response);
    }

    // Check if message exists
    const message = await GroupChat.findById(messageId);
    if (!message) {
      const response = createResponse("error", 1, "Message not found");
      return res.status(404).json(response);
    }

    // Prevent users from reporting their own messages
    if (message.userId.toString() === reporterUserId.toString()) {
      const response = createResponse(
        "error",
        1,
        "You cannot report your own messages"
      );
      return res.status(400).json(response);
    }

    // Check if user has already reported this message
    const existingReport = await MessageReport.findOne({
      messageId: messageId,
      reporterUserId: reporterUserId,
    });

    if (existingReport) {
      const response = createResponse(
        "error",
        1,
        "You have already reported this message"
      );
      return res.status(400).json(response);
    }

    // Create new report
    const newReport = new MessageReport({
      _id: new mongoose.Types.ObjectId(),
      messageId,
      reportedUserId,
      reportedUsername,
      reporterUserId,
      reporterUsername,
      reason,
      reportedText,
      status: "pending",
      reportDate: new Date(),
    });

    // Save the report
    const savedReport = await newReport.save();

    // Update message status and report count
    const reportCount = await MessageReport.countDocuments({ messageId });
    await GroupChat.findByIdAndUpdate(messageId, {
      isReported: true,
      reportCount: reportCount,
    });

    // Log the report for monitoring
    console.log(`Message reported - ID: ${messageId}, Reporter: ${reporterUsername}, Reason: ${reason}`);

    const response = createResponse(
      "success",
      0,
      "Message reported successfully",
      {
        reportId: savedReport._id,
        status: savedReport.status,
        reportDate: savedReport.reportDate,
      }
    );

    return res.status(201).json(response);
  } catch (error) {
    console.log("Error reporting message:", error);
    
    // Handle duplicate report error specifically
    if (error.code === 11000) {
      const response = createResponse(
        "error",
        1,
        "You have already reported this message"
      );
      return res.status(400).json(response);
    }

    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

// Get all reported messages for admin review
exports.get_reported_messages = async (req, res, next) => {
  try {
    console.log('🔍 Admin fetching reported messages...');

    // Get all reports with populated message and user data
    const reports = await MessageReport.find()
      .populate({
        path: 'messageId',
        model: 'GroupChat',
        select: 'message authorName userId date isReported reportCount',
      })
      .populate('reportedUserId', 'firstName lastName email')
      .populate('reporterUserId', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ reportDate: -1 })
      .exec();

    // Filter out reports where the message was deleted
    const validReports = reports.filter(report => report.messageId !== null);

    console.log(`✅ Found ${validReports.length} reported messages`);

    const response = createResponse(
      "success",
      0,
      "Reported messages retrieved successfully",
      {
        reports: validReports,
        totalCount: validReports.length,
      }
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error fetching reported messages:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

// Update report status (admin action)
exports.update_report_status = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, reviewNotes, reviewedBy } = req.body;

    console.log(`🔄 Admin updating report status: ${reportId} -> ${status}`);

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      const response = createResponse(
        "error",
        1,
        "Invalid status. Must be one of: pending, reviewed, resolved, dismissed"
      );
      return res.status(400).json(response);
    }

    // Find and update the report
    const updatedReport = await MessageReport.findByIdAndUpdate(
      reportId,
      {
        status,
        reviewedBy: reviewedBy || null,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || '',
      },
      { new: true }
    )
    .populate('messageId', 'message authorName userId date')
    .populate('reportedUserId', 'firstName lastName email')
    .populate('reporterUserId', 'firstName lastName email')
    .populate('reviewedBy', 'firstName lastName email');

    if (!updatedReport) {
      const response = createResponse("error", 1, "Report not found");
      return res.status(404).json(response);
    }

    console.log(`✅ Report ${reportId} status updated to: ${status}`);

    const response = createResponse(
      "success",
      0,
      "Report status updated successfully",
      updatedReport
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error updating report status:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

// Admin delete message (removes message and updates all related reports)
exports.admin_delete_message = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { adminId, reason } = req.body;

    console.log(`🗑️ Admin deleting message: ${messageId}`);

    // Find the message
    const message = await GroupChat.findById(messageId);
    if (!message) {
      const response = createResponse("error", 1, "Message not found");
      return res.status(404).json(response);
    }

    // Update all related reports to resolved status
    await MessageReport.updateMany(
      { messageId: messageId },
      {
        status: 'resolved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: `Message deleted by admin. Reason: ${reason || 'Policy violation'}`,
      }
    );

    // Delete the message
    await GroupChat.findByIdAndDelete(messageId);

    console.log(`✅ Message ${messageId} deleted by admin`);
    console.log(`📊 Related reports marked as resolved`);

    const response = createResponse(
      "success",
      0,
      "Message deleted successfully and reports resolved",
      {
        deletedMessageId: messageId,
        deletionReason: reason || 'Policy violation',
        deletedBy: adminId,
        deletedAt: new Date(),
      }
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error in admin message deletion:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};

// Get count of pending reported messages
exports.get_pending_reports_count = async (req, res, next) => {
  try {
    console.log('📊 Fetching pending reports count...');

    // Count reports with status "pending"
    const pendingCount = await MessageReport.countDocuments({
      status: "pending"
    });

    console.log(`✅ Pending reports count: ${pendingCount}`);

    const response = createResponse(
      "success",
      0,
      "Pending reports count retrieved successfully",
      {
        count: pendingCount,
      }
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error fetching pending reports count:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};