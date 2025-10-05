// 1) Imports
const mongoose = require("mongoose");
const User = require("../models/user");
const BroadcastLog = require("../models/groupChatBroadcastLog");
const sendPushNotification = require("./pushNotification");

/**
 * Send push notifications to all users (except author) for a new group chat message
 * Implements global rate limiting based on broadcast count within cooldown period
 *
 * @param {String} messageText - The message content
 * @param {String} messageId - The message ID
 * @param {String} authorId - The author's user ID
 * @param {String} authorName - The author's display name
 * @returns {Object} - { sent: number, skipped: string|null, error: string|null }
 */
const sendGroupChatNotifications = async (messageText, messageId, authorId, authorName) => {
  try {
    // 1. Check if push notifications are enabled
    const pushEnabled = process.env.GROUP_CHAT_PUSH_ENABLED === 'true';

    if (!pushEnabled) {
      console.log('⚠️ Group Chat Push: Disabled via environment variable');
      return { sent: 0, skipped: 'disabled' };
    }

    // 2. Get configuration from environment variables
    const cooldownMinutes = parseInt(process.env.GROUP_CHAT_PUSH_COOLDOWN_MINUTES) || 30;
    const maxBroadcasts = parseInt(process.env.GROUP_CHAT_PUSH_MAX_BROADCASTS) || 2;
    const cooldownMs = cooldownMinutes * 60 * 1000;

    console.log(`📊 Group Chat Push: Config - Max ${maxBroadcasts} broadcasts per ${cooldownMinutes} minutes`);

    // 3. Check global rate limit
    const cutoffTime = new Date(Date.now() - cooldownMs);
    const recentBroadcastCount = await BroadcastLog.countDocuments({
      broadcastAt: { $gte: cutoffTime }
    });

    console.log(`📊 Group Chat Push: Recent broadcasts in last ${cooldownMinutes}min: ${recentBroadcastCount}/${maxBroadcasts}`);

    if (recentBroadcastCount >= maxBroadcasts) {
      console.log(`⏭️ Group Chat Push: Rate limit reached (${recentBroadcastCount}/${maxBroadcasts}). Skipping broadcast.`);
      return { sent: 0, skipped: 'rate_limited' };
    }

    // 4. Get all users with device tokens (except the message author)
    const recipients = await User.find({
      _id: { $ne: authorId },
      deviceToken: { $exists: true, $ne: null, $ne: "" }
    }).select('_id deviceToken device');

    if (recipients.length === 0) {
      console.log('⚠️ Group Chat Push: No recipients found with device tokens');
      return { sent: 0, skipped: 'no_recipients' };
    }

    console.log(`📱 Group Chat Push: Sending to ${recipients.length} recipients`);

    // 5. Prepare notification content
    const notificationTitle = "Ομαδική συνομιλία";
    const notificationBody = "Έχετε ένα νέο μήνυμα";

    // 6. Send notifications to all recipients
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        await sendPushNotification(
          recipient.deviceToken,
          notificationTitle,
          notificationBody,
          recipient.device
        );
        sentCount++;
      } catch (error) {
        console.error(`❌ Group Chat Push: Failed for user ${recipient._id} - ${error.message}`);
        failedCount++;
      }
    }

    // 7. Log the broadcast event
    const expiresAt = new Date(Date.now() + cooldownMs);

    await BroadcastLog.create({
      _id: new mongoose.Types.ObjectId(),
      messageId: messageId,
      broadcastAt: new Date(),
      recipientCount: sentCount,
      expiresAt: expiresAt
    });

    console.log(`✅ Group Chat Push: Broadcast completed - ${sentCount} sent, ${failedCount} failed`);
    console.log(`⏰ Group Chat Push: Next broadcast available after ${new Date(Date.now() + cooldownMs).toLocaleTimeString()}`);

    return {
      sent: sentCount,
      failed: failedCount,
      skipped: null
    };

  } catch (error) {
    console.error('❌ Group Chat Push: Unexpected error:', error);
    return {
      sent: 0,
      skipped: null,
      error: error.message
    };
  }
};

module.exports = {
  sendGroupChatNotifications
};
