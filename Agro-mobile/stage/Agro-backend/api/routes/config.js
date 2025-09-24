// 1) Imports
const express = require("express");
const router = express.Router();
const ConfigController = require("../controllers/config");

// 2) Requests Functionality

// [GET] - Get API configuration
router.get("/", ConfigController.get_config);

// 3) Export
module.exports = router;
