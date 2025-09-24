// 1) Imports
const mongoose = require("mongoose");
const Comment = require("../models/comments");
const CommentNotification = require("../models/commentsNotification");
const Post = require("../models/posts");
const User = require("../models/user");
const { createResponse } = require("../utils/responseUtils");

// 2) Functions + Exports

exports.comments_get_all = (req, res, next) => {
  Comment.find()
    .select("title publishedAt text _id")
    .exec()
    .then((docs) => {
      console.log("All Comments :", docs); //here needs text logging

      //create the response object
      const response = {
        count: docs.length,
        result: "success",
        resultCode: 0,
        data: docs,
      };

      //return the response
      res.status(200).json(response);
    })
    .catch((error) => {
      console.log("Error: ", error);

      //create the response object
      const response = {
        result: "error",
        resultCode: 1,
        error: error,
      };

      //Response
      res.status(500).json(response);
    });
};

exports.comments_publish_comment = async (req, res, next) => {
  try {
    // Check if postId is correct
    if (!req.body.postId.match(/^[0-9a-fA-F]{24}$/)) {
      const response = createResponse("error", 1, "Not a valid postId");
      return res.status(404).json(response);
    }

    // Find post
    const post = await Post.findById(req.body.postId);

    // Check if post found
    if (!post) {
      const response = createResponse("error", 1, "Post not found");
      return res.status(404).json(response);
    }

    const comment = new Comment({
      _id: new mongoose.Types.ObjectId(),
      post: req.body.postId,
      author: req.body.author,
      authorId: req.body.authorId,
      authorAvatar: req.body.authorAvatar,
      publishedAt: new Date(),
      content: req.body.content,
    });

    // Store comment
    const storedComment = await comment.save();

    // Create comment notifications for other users
    await createCommentNotifications(
      post._id,
      storedComment._id,
      req.body.authorId
    );

    const response = createResponse("success", 0, "Comment stored", {
      _id: storedComment._id,
      author: storedComment.author,
      authorId: storedComment.authorId,
      authorAvatar: storedComment.authorAvatar,
      publishedAt: storedComment.publishedAt,
      content: storedComment.content,
    });

    return res.status(201).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error);
    return res.status(500).json(response);
  }
};

exports.comments_delete_comment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId).exec();

    if (!comment) {
      const response = createResponse("error", 1, "Comment not found");
      return res.status(404).json(response);
    }

    const postId = comment.post;

    // Delete the comment
    await Comment.deleteOne({ _id: commentId }).exec();

    // Delete the associated notification(s)
    await CommentNotification.deleteMany({ commentId }).exec();

    // Update the comment count on the associated post
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentCount: -1 } },
      { new: true }
    ).exec();

    const response = createResponse(
      "success",
      0,
      "Comment and associated notification(s) deleted"
    );

    res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error);
    res.status(500).json(response);
  }
};

exports.comments_publish_replyComment = async (req, res, next) => {
  try {
    // Check if commentId is correct
    if (!req.body.commentId.match(/^[0-9a-fA-F]{24}$/)) {
      const response = createResponse("error", 1, "Not a valid commentId");
      return res.status(404).json(response);
    }

    // Find parent comment
    const parentComment = await Comment.findById(req.body.commentId);

    // Check if parent comment found
    if (!parentComment) {
      const response = createResponse("error", 1, "Parent comment not found");
      return res.status(404).json(response);
    }

    const reply = {
      _id: new mongoose.Types.ObjectId(),
      authorId: req.body.authorId,
      author: req.body.author,
      authorAvatar: req.body.authorAvatar,
      publishedAt: new Date(),
      content: req.body.content,
    };

    // Add reply to parent comment
    parentComment.replies.push(reply);

    // Save the updated parent comment
    const updatedParentComment = await parentComment.save();

    // Check if the author of the parent comment is the same as the user replying
    if (parentComment.authorId !== req.body.authorId) {
      await createCommentNotifications(
        parentComment.post,
        req.body.commentId,
        req.body.authorId
      );
    }

    const response = createResponse("success", 0, "Reply stored", {
      reply: {
        _id: reply._id,
        authorId: reply.authorId,
        author: reply.author,
        authorAvatar: reply.authorAvatar,
        publishedAt: reply.publishedAt,
        content: reply.content,
      },
      parentComment: {
        _id: updatedParentComment._id,
        authorId: updatedParentComment.authorId,
        author: updatedParentComment.author,
        authorAvatar: updatedParentComment.authorAvatar,
        publishedAt: updatedParentComment.publishedAt,
        content: updatedParentComment.content,
      },
    });

    return res.status(201).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error);
    return res.status(500).json(response);
  }
};

exports.comments_delete_replyComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const replyId = req.params.replyId;

    console.log("0) CONTROLLER FOR DELETED COMMENT STARTED");

    const comment = await Comment.findById(commentId).exec();

    if (!comment) {
      const response = {
        result: "error",
        resultCode: 1,
        error: "Comment not found",
      };
      return res.status(404).json(response);
    }

    // Find the index of the reply in the replies array
    const replyIndex = comment.replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );

    if (replyIndex === -1) {
      const response = {
        result: "error",
        resultCode: 1,
        error: "Reply not found",
      };
      return res.status(404).json(response);
    }

    const deletedReply = comment.replies[replyIndex];

    console.log("1) REPLY MUST BE DELETED : ", deletedReply);

    // Remove the reply from the replies array
    comment.replies.pull(comment.replies[replyIndex]._id);

    await comment.save();

    const response = {
      result: "success",
      resultCode: 0,
      message: "Reply and associated notification(s) deleted",
    };
    res.status(200).json(response);
  } catch (error) {
    console.log("Error deleting reply:", error);
    const response = {
      result: "error",
      resultCode: 1,
      error: error,
    };
    res.status(500).json(response);
  }
};

exports.comments_report_comment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const { reported, reportedReason } = req.body;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { reported, reportedReason },
      { new: true }
    ).exec();

    if (!comment) {
      const response = createResponse("error", 1, "Comment not found");
      return res.status(404).json(response);
    }

    const response = createResponse(
      "success",
      0,
      "Comment reported successfully",
      comment
    );

    res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    res.status(500).json(response);
  }
};

exports.comments_report_replyComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const replyId = req.params.replyId;
    const { reported, reportedReason } = req.body;

    const comment = await Comment.findById(commentId).exec();

    if (!comment) {
      const response = createResponse("error", 1, "Comment not found");
      return res.status(404).json(response);
    }

    // Find the index of the reply in the replies array
    const replyIndex = comment.replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );

    if (replyIndex === -1) {
      const response = createResponse("error", 1, "Reply not found");
      return res.status(404).json(response);
    }

    // Update the reported and reportedReason fields of the selected reply
    comment.replies[replyIndex].reported = reported;
    comment.replies[replyIndex].reportedReason = reportedReason;

    await comment.save();

    const response = createResponse(
      "success",
      0,
      "Reply comment reported successfully",
      comment.replies[replyIndex]
    );

    res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    res.status(500).json(response);
  }
};

exports.comments_get_reported = (req, res, next) => {
  Comment.find({ reported: true }) // Add this condition to filter reported comments
    .select("-replies") // Exclude the 'replies' field
    .exec()
    .then((docs) => {
      console.log("Reported Comments :", docs);

      // Return the response with the array of comments
      res.status(200).json({
        result: "success",
        resultCode: 0,
        data: docs,
      });
    })
    .catch((error) => {
      console.log("Error: ", error);

      // Response in case of an error
      res.status(500).json({
        result: "error",
        resultCode: 1,
        error: error,
      });
    });
};

// PUSH NOTIFICATION TO INTERACTED USERS + ADMINS
const createCommentNotifications = async (postId, commentId, authorId) => {
  try {
    // Fetch all commenters and repliers for the post
    const commenters = await Comment.distinct("authorId", { post: postId });
    const repliers = await Comment.distinct("replies.authorId", {
      post: postId,
    });

    // Fetch admin users
    const adminUsers = await User.find({ isAdmin: true }, "_id");

    // Create a Set to store unique userIds
    const userIdSet = new Set([
      ...commenters,
      ...repliers,
      ...adminUsers.map((user) => user._id.toString()),
    ]);

    // Convert the Set back to an array
    const usersToNotify = Array.from(userIdSet);

    // Filter out the authorId from usersToNotify
    const usersToNotifyFiltered = usersToNotify.filter(
      (userId) => userId !== authorId
    );

    // Fetch existing notifications for the given post
    const existingNotifications = await CommentNotification.find({ postId });

    // Create a Set to store unique userIds
    const uniqueUserIds = new Set();

    // Add userIds to the Set only if they don't have an existing notification on this post
    existingNotifications.forEach((notification) => {
      uniqueUserIds.add(notification.user.toString());
    });

    // Filter out the user IDs that already have notifications
    const usersToNotifyFinal = usersToNotifyFiltered.filter(
      (userId) => !uniqueUserIds.has(userId)
    );

    // Create notifications only for users who don't have an existing notification on this post
    const notifications = usersToNotifyFinal.map((userId) => ({
      _id: new mongoose.Types.ObjectId(),
      postId,
      commentId,
      user: userId,
      type: "comment",
    }));

    // Store the comment notifications
    await CommentNotification.insertMany(notifications);
  } catch (error) {
    console.error("Error creating comment notifications:", error);
    //   throw error;
  }
};

// PUSH NOTIFICATIONS ONLY TO INTERACTED USERS

// const createCommentNotifications = async (postId, commentId, authorId) => {
//   // Fetch all commenters and repliers for the post
//   const commenters = await Comment.distinct("authorId", { post: postId });
//   const repliers = await Comment.distinct("replies.authorId", { post: postId });

//   // Create a Set to store unique userIds
//   const userIdSet = new Set([...commenters, ...repliers]);

//   // Convert the Set back to an array
//   const usersToNotify = Array.from(userIdSet);

//   //console.log("ALL USERS INTERACTED :", usersToNotify);

//   // Filter out the authorId from usersToNotify
//   const usersToNotifyFiltered = usersToNotify.filter(
//     (userId) => userId !== authorId
//   );

//   //console.log("FILTER OUT THE AUTHOR ID :", usersToNotifyFiltered);

//   // Fetch existing notifications for the given post
//   const existingNotifications = await CommentNotification.find({ postId });

//   //console.log("EXISTING NOTIFICATIONS :", existingNotifications);

//   // Create a Set to store unique userIds
//   const uniqueUserIds = new Set();

//   // Add userIds to the Set only if they don't have an existing notification on this post
//   existingNotifications.forEach((notification) => {
//     uniqueUserIds.add(notification.user.toString());
//   });

//   // Filter out the user IDs that already have notifications
//   const usersToNotifyFinal = usersToNotifyFiltered.filter(
//     (userId) => !uniqueUserIds.has(userId)
//   );

//   //console.log("USERS : ", usersToNotifyFinal);

//   // Create notifications only for users who don't have an existing notification on this post
//   const notifications = usersToNotifyFinal.map((userId) => ({
//     _id: new mongoose.Types.ObjectId(),
//     postId,
//     commentId,
//     user: userId,
//     type: "comment",
//   }));

//   // Store the comment notifications
//   await CommentNotification.insertMany(notifications);
// };
