// 1) Imports
const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const SettingsController = require("../controllers/settings");

// 2) Requests Functionality

// [GET] - Get all settings
router.get("/", SettingsController.get_all_settings);

// [POST] - Edit Settings
router.post("/", checkAuth, SettingsController.post_settings);

// [GET] - Get a specific Setting

router.get(
  "/serverSettings/:settingId",
  SettingsController.get_server_settings
);

router.get("/:settingId", checkAuth, SettingsController.get_specific_setting);

// 3) Export
module.exports = router;
