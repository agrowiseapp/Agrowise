// 1) Imports
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Post = require("../models/posts");
const Comments = require("../models/comments");
const CommentNotification = require("../models/commentsNotification");
const User = require("../models/user");
const { createResponse } = require("../utils/responseUtils");
const sendPushNotification = require("../utils/pushNotification");

// 2) Functions + Exports

exports.posts_get_all = (req, res, next) => {
  let postsWithComments;

  Post.find()
    .select("author title publishedAt text _id imageUrl")
    .sort({ publishedAt: -1 })
    .limit(50)
    .exec()
    .then((docs) => {
      const postIds = docs.map((post) => post._id);

      Comments.aggregate([
        { $match: { post: { $in: postIds } } },
        {
          $group: {
            _id: "$post",
            count: { $sum: 1 },
            replyCount: { $sum: { $size: "$replies" } },
          },
        },
      ])
        .exec()
        .then((comments) => {
          postsWithComments = docs.map((post) => {
            const comment = comments.find((c) => c._id.equals(post._id));
            return {
              _id: post._id,
              author: post.author,
              title: post.title,
              publishedAt: post.publishedAt,
              text: post.text,
              imageUrl: post.imageUrl || null, // Fallback to null if no image
              comments: comment ? comment.count : 0,
              replyComments: comment ? comment.replyCount : 0,
              unreadComments: 0,
            };
          });

          const token = req.headers.authorization.split(" ")[1];
          const decoded = jwt.verify(token, process.env.JWT_KEY);
          const userId = decoded.userId;

          if (userId == null || userId == undefined) {
            const response = {
              result: "error",
              resultCode: 1,
              error: "Could not authorize user.",
            };

            return res.status(404).json(response);
          }

          User.findOne({ _id: userId })
            .exec()
            .then(async (user) => {
              if (!user) {
                console.log("Couldn't find user");

                const response = {
                  result: "error",
                  resultCode: 1,
                  error: "Couldn't find user",
                };

                return res.status(401).json(response);
              }

              // Create an array of post titles
              const postTitles = postsWithComments.map((post) => post.title);

              // Find the unread comments for the user's posts
              const unreadComments = await CommentNotification.find({
                user: userId,
                postId: { $in: postIds },
              });

              // Update the unread comments count for each post
              postsWithComments.forEach((post) => {
                const hasUnreadComment = unreadComments.some(
                  (notification) =>
                    notification.postId.toString() === post._id.toString()
                );
                if (hasUnreadComment) {
                  post.unreadComments = 1;
                }
              });

              const response = {
                count: docs.length,
                result: "success",
                resultCode: 0,
                data: postsWithComments,
              };

              res.status(200).json(response);
            });
        });
    })
    .catch((error) => {
      console.log("Error: ", error);

      const response = {
        result: "error",
        resultCode: 1,
        error: error,
      };

      res.status(500).json(response);
    });
};

exports.posts_get_number = (req, res, next) => {
  Post.find()
    .countDocuments()
    .exec()
    .then((count) => {
      const response = {
        count: count,
        result: "success",
        resultCode: 0,
      };

      res.status(200).json(response);
    })
    .catch((error) => {
      console.log("Error: ", error);

      const response = {
        result: "error",
        resultCode: 1,
        error: error,
      };

      res.status(500).json(response);
    });
};

exports.posts_get_images_number = (req, res, next) => {
  Post.find({ imageUrl: { $ne: null } })
    .countDocuments()
    .exec()
    .then((count) => {
      const response = {
        count: count,
        result: "success",
        resultCode: 0,
      };

      res.status(200).json(response);
    })
    .catch((error) => {
      console.log("Error: ", error);

      const response = {
        result: "error",
        resultCode: 1,
        error: error,
      };

      res.status(500).json(response);
    });
};

exports.posts_publish_post = (req, res, next) => {
  try {
    // Validate required fields
    if (!req.body.title || !req.body.text || !req.body.author) {
      const response = {
        result: "error",
        resultCode: 1,
        error: "Title, text, and author are required fields",
      };
      return res.status(400).json(response);
    }

    // Create post with fallback for imageUrl
    const post = new Post({
      _id: new mongoose.Types.ObjectId(),
      author: req.body.author,
      title: req.body.title,
      text: req.body.text,
      publishedAt: new Date(),
      post_with_url: req.body.post_with_url || null,
      republished: req.body.republished || null,
      imageUrl: req.body.imageUrl || null, // Fallback to null if no image
    });

    // Save Post
    post
      .save()
      .then(async (result) => {
        // Send push notifications to users with device tokens
        try {
          const users = await User.find({
            deviceToken: { $exists: true, $ne: null, $ne: "" },
          }).select("deviceToken device");

          const notificationTitle = result.title;
          const notificationBody = "Μπείτε στην εφαρμογή για να διαβάσετε ολόκληρο το άρθρο!";

          // Send notifications with proper error handling
          let notificationErrors = 0;
          let notificationsSent = 0;

          for (const user of users) {
            try {
              const deviceToken = user.deviceToken;
              const deviceType = user.device;

              if (deviceToken && deviceType) {
                await sendPushNotification(
                  deviceToken,
                  notificationTitle,
                  notificationBody,
                  deviceType
                );
                notificationsSent++;
              }
            } catch (notificationError) {
              notificationErrors++;
              // Continue with other notifications even if one fails
            }
          }

          console.log(`📱 Push: Sent ${notificationsSent} notifications successfully`);
          if (notificationErrors > 0) {
            console.log(`❌ Push: Failed to send ${notificationErrors} notifications`);
          }
        } catch (notificationError) {
          console.log("❌ Notification system error:", notificationError.message);
        }

        // Create the response object
        const response = {
          result: "success",
          resultCode: 0,
          message: "Post created successfully",
          data: {
            id: result._id,
            title: result.title,
            text: result.text,
            publishedAt: result.publishedAt,
            post_with_url: result.post_with_url,
            republished: result.republished,
            imageUrl: result.imageUrl,
          },
        };

        res.status(201).json(response);
      })
      .catch((saveError) => {
        console.log("❌ Save error:", saveError.message);
        const response = {
          result: "error",
          resultCode: 1,
          error: "Failed to save post",
        };
        res.status(500).json(response);
      });
  } catch (error) {
    console.log("❌ Post creation error:", error.message);
    const response = {
      result: "error",
      resultCode: 1,
      error: "Failed to create post",
    };
    res.status(500).json(response);
  }
};

exports.posts_user_commented = (req, res, next) => {
  const userId = req.params.userId;

  Comments.aggregate([
    { $match: { authorId: userId } },
    {
      $group: {
        _id: "$post",
        comments: { $sum: 1 },
      },
    },
  ])
    .exec()
    .then((commentCounts) => {
      const postIds = commentCounts.map((item) => item._id);

      Post.aggregate([
        { $match: { _id: { $in: postIds } } },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "post",
            as: "allComments",
          },
        },
        {
          $addFields: {
            comments: { $size: "$allComments" },
          },
        },
      ])
        .exec()
        .then((postsWithComments) => {
          const response = {
            count: postsWithComments.reduce(
              (total, post) => total + post.comments,
              0
            ),
            result: "success",
            resultCode: 0,
            data: postsWithComments,
          };

          res.status(200).json(response);
        });
    })
    .catch((error) => {
      console.log("Error:", error);

      const response = {
        result: "error",
        resultCode: 1,
        error: error,
      };

      res.status(500).json(response);
    });
};

exports.posts_delete_posts = async (req, res, next) => {
  const id = req.params.postId;
  const postId = req.params.postId;

  try {
    // Find the post to get the associated comments
    const post = await Post.findById(id).exec();

    if (!post) {
      const response = {
        result: "error",
        resultCode: 1,
        message: "Post not found",
      };
      return res.status(404).json(response);
    }

    // Delete the associated notification(s)
    await CommentNotification.deleteMany({ postId }).exec();

    // Delete the comments associated with the post
    await Comments.deleteMany({ post: id }).exec();

    // Delete the post
    await Post.deleteOne({ _id: id }).exec();

    // Create the response object
    const response = {
      result: "success",
      resultCode: 0,
      message: "Post and associated comments deleted",
    };

    res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);

    // Create the response object
    const response = {
      result: "error",
      resultCode: 1,
      error: error,
    };

    res.status(500).json(response);
  }
};

exports.posts_get_post = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId;

    // Check if there is an associated notification for the user and post
    const notification = await CommentNotification.findOne({
      postId: postId,
      user: userId,
    }).exec();

    // If a notification exists, delete it
    if (notification) {
      await CommentNotification.deleteOne({ _id: notification._id }).exec();
    }

    const post = await Post.findById(postId);

    if (!post) {
      const response = createResponse("error", 1, "Post not found");
      return res.status(404).json(response);
    }

    const comments = await Comments.find({ post: postId })
      .sort({ publishedAt: 1 }) // Sort by publishedAt in ascending order (oldest to newest)
      .populate({
        path: "replies",
        select: "-post -__v",
        populate: {
          path: "replies",
          select: "-post -__v",
        },
      })
      .exec();

    // const commentsWithOwnership = comments.map((comment) => {
    //   const isMine = comment.authorId === userId;
    //   const repliesWithOwnership = comment.replies.map((reply) => ({
    //     ...reply.toObject(),
    //     isMine: reply.authorId === userId,
    //   }));
    //   return { ...comment.toObject(), isMine, replies: repliesWithOwnership };
    // });

    const commentsWithOwnership = comments.map((comment) => {
      const isMine = comment.authorId === userId;
      const reported = comment.reported;

      // If the comment is reported, exclude the replies
      if (reported) {
        // Create a new comment object without the replies field
        const { replies, ...modifiedComment } = comment.toObject();
        modifiedComment.isMine = isMine;
        modifiedComment.reported = reported;
        return modifiedComment;
      } else {
        // Otherwise, include the replies
        const repliesWithOwnership = comment.replies.map((reply) => ({
          ...reply.toObject(),
          isMine: reply.authorId === userId,
        }));
        const modifiedComment = {
          ...comment.toObject(),
          isMine,
          replies: repliesWithOwnership,
        };
        return modifiedComment;
      }
    });

    const postWithComments = {
      post,
      comments: commentsWithOwnership,
    };

    const response = createResponse(
      "success",
      0,
      "Post with comments fetched",
      postWithComments
    );
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error:", error);
    const response = createResponse("error", 1, error.message);
    return res.status(500).json(response);
  }
};
