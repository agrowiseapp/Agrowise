// 1) Imports
const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const PostsController = require("../controllers/posts");

// 2) Requests Functionality

// [GET] - Get all posts
router.get("/", checkAuth, PostsController.posts_get_all);

// [POST] - Create a new Post
router.post("/", checkAuth, PostsController.posts_publish_post);

// [GET] = GET number of posts
router.get("/number", checkAuth, PostsController.posts_get_number);

// [GET] = GET number of posts with images
router.get("/images/number", checkAuth, PostsController.posts_get_images_number);

// [GET] - Get a specific Post
router.get("/:postId", PostsController.posts_get_post);

// [DELETE] - Delete existing Post
router.delete("/:postId", checkAuth, PostsController.posts_delete_posts);

// [GET] - Get Posts that user commented
router.get("/userCommented/:userId", PostsController.posts_user_commented);

// 3) Export
module.exports = router;
