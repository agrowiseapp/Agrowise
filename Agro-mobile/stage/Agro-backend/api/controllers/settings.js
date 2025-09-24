// 1) Imports
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Settings = require("../models/settings");
const { createResponse } = require("../utils/responseUtils");
require("dotenv").config();

// 2) Requests Functionality

exports.get_all_settings = (req, res, next) => {
  Settings.find()
    .exec()
    .then((settings) => {
      console.log("Settings:", settings);

      if (settings.length < 1) {
        const response = createResponse("error", 1, "Couldn't find setting");
        return res.status(401).json(response);
      } else {
        const response = createResponse("success", 0, settings);
        return res.status(201).json(response);
      }
    })
    .catch((error) => {
      console.log("Error:", error);
      const response = createResponse("error", 1, error);
      res.status(500).json(response);
    });
};

exports.post_settings = (req, res, next) => {
  // Extract the settings data from the request body
  const { setting_id, data } = req.body;

  // Delete the existing settings for the given setting_id
  Settings.deleteMany({ setting_id })
    .then(() => {
      if (data.length === 0) {
        // If data array is empty, return success response
        const response = createResponse(
          "success",
          0,
          "Settings deleted successfully",
          { data: [] }
        );
        return res.status(200).json(response);
      } else {
        // Create an array to hold the new settings documents
        const newSettings = data.map((item) => ({
          _id: new mongoose.Types.ObjectId(),
          setting_id: setting_id,
          name: item.name,
          url: item.url,
        }));

        // Save all the new settings documents to the database
        Settings.insertMany(newSettings)
          .then((result) => {
            const response = createResponse(
              "success",
              0,
              "Settings updated successfully",
              { data: result }
            );
            return res.status(201).json(response);
          })
          .catch((error) => {
            console.log("Error:", error);
            const response = createResponse("error", 1, error);
            res.status(500).json(response);
          });
      }
    })
    .catch((error) => {
      console.log("Error:", error);
      const response = createResponse("error", 1, error);
      res.status(500).json(response);
    });
};

exports.get_server_settings = async (req, res, next) => {
  try {
    const settingId = req.params.settingId;

    const setting = await Settings.find({ setting_id: settingId }).exec();

    if (!setting) {
      const response = createResponse(
        "error",
        1,
        "No valid entry found for this Id: settings"
      );
      return res.status(404).json(response);
    }

    const response = createResponse("success", 0, "Setting returned", {
      data: setting,
    });
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error retrieving setting:", error);

    const response = createResponse(
      "error",
      1,
      "Error retrieving setting",
      error
    );
    return res.status(500).json(response);
  }
};

exports.get_specific_setting = async (req, res, next) => {
  try {
    const settingId = req.params.settingId;

    const setting = await Settings.find({ setting_id: settingId }).exec();

    if (!setting) {
      const response = createResponse(
        "error",
        1,
        "No valid entry found for this Id: settings"
      );
      return res.status(404).json(response);
    }

    const response = createResponse("success", 0, "Setting returned", {
      data: setting,
    });
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error retrieving setting:", error);

    const response = createResponse(
      "error",
      1,
      "Error retrieving setting",
      error
    );
    return res.status(500).json(response);
  }
};
