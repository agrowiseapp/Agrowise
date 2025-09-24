// 1) Imports
const jwt = require("jsonwebtoken");

// 3) Exports

module.exports = async (req, res, next) => {
  try {
    console.log("Token Auth Started");

    // Check if authorization header exists
    if (!req.headers.authorization) {
      console.log("No authorization header provided");
      const response = {
        result: "error",
        resultCode: 1,
        error: { message: "No authorization header provided" },
      };
      return res.status(401).json(response);
    }

    // Check if authorization header has the correct format
    const authHeader = req.headers.authorization;
    if (!authHeader.startsWith("Bearer ")) {
      console.log("Invalid authorization header format");
      const response = {
        result: "error",
        resultCode: 1,
        error: { message: "Invalid authorization header format" },
      };
      return res.status(401).json(response);
    }

    const token = authHeader.split(" ")[1];
    
    // Check if token exists after split
    if (!token || token === "null" || token === "undefined") {
      console.log("No token provided or token is null/undefined");
      const response = {
        result: "error",
        resultCode: 1,
        error: { message: "No valid token provided" },
      };
      return res.status(401).json(response);
    }

    const decoded = await jwt.verify(token, process.env.JWT_KEY);
    req.userData = decoded;

    next();
  } catch (error) {
    console.log("JWT Auth Error:", error.name, "-", error.message);

    if (error instanceof jwt.TokenExpiredError) {
      // Token has expired
      const response = {
        result: "error",
        resultCode: 1,
        error: { message: "Token expired" },
      };
      return res.status(401).json(response); // Changed from 500 to 401
    } else if (error instanceof jwt.JsonWebTokenError) {
      // Handle malformed JWT specifically
      console.log("Malformed JWT token received");
      const response = {
        result: "error",
        resultCode: 1,
        error: { message: "Invalid token format" },
      };
      return res.status(401).json(response);
    } else if (error instanceof jwt.NotBeforeError) {
      // Token not active yet
      const response = {
        result: "error",
        resultCode: 1,
        error: { message: "Token not active yet" },
      };
      return res.status(401).json(response);
    } else {
      // Other unexpected errors
      console.log("Unexpected JWT error:", error);
      const response = {
        result: "error",
        resultCode: 1,
        error: { message: "Authentication failed" },
      };
      return res.status(401).json(response);
    }
  }
};
