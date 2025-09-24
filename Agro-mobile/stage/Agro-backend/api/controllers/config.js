// 1) Imports
const { createResponse } = require("../utils/responseUtils");
require("dotenv").config();

// 2) Requests Functionality

exports.get_config = (req, res, next) => {
  try {
    // Get configuration from environment variables
    const config = {
      apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3001",
      imageBaseUrl: process.env.IMAGE_BASE_URL || "https://i.ibb.co",
      // Add more config values as needed
      appName: process.env.APP_NAME || "AgroWise",
      version: process.env.APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development"
    };

    const response = createResponse(
      "success",
      0,
      "Configuration retrieved successfully",
      config
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log("Config error:", error);
    const response = createResponse("error", 1, "Failed to retrieve configuration");
    return res.status(500).json(response);
  }
};

// 3) Export
module.exports = {
  get_config: exports.get_config
};
