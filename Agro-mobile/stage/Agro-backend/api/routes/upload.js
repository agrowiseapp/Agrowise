// 1) Imports
const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const UploadController = require("../controllers/upload");

// 2) Requests Functionality

// [POST] - Upload image to ImgBB
router.post("/image", checkAuth, UploadController.upload_image);

// 3) Export
module.exports = router;
