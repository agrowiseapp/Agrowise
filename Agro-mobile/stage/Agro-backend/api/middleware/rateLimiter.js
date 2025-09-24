const rateLimit = require('express-rate-limit');

// General API rate limiter - applies to all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    result: "error",
    resultCode: 1,
    error: {
      message: "Too many requests from this IP, please try again later."
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      result: "error",
      resultCode: 1,
      error: {
        message: "Too many requests from this IP, please try again later."
      }
    });
  }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    result: "error",
    resultCode: 1,
    error: {
      message: "Too many login attempts from this IP, please try again later."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      result: "error",
      resultCode: 1,
      error: {
        message: "Too many login attempts from this IP, please try again later."
      }
    });
  }
});

// Upload rate limiter - more restrictive for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: {
    result: "error",
    resultCode: 1,
    error: {
      message: "Too many uploads from this IP, please try again later."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Upload rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      result: "error",
      resultCode: 1,
      error: {
        message: "Too many uploads from this IP, please try again later."
      }
    });
  }
});

// Comment rate limiter - moderate limits for user interactions
const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // Limit each IP to 30 comments per 10 minutes
  message: {
    result: "error",
    resultCode: 1,
    error: {
      message: "Too many comments from this IP, please slow down."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Comment rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      result: "error",
      resultCode: 1,
      error: {
        message: "Too many comments from this IP, please slow down."
      }
    });
  }
});

// Password reset rate limiter - very strict
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  message: {
    result: "error",
    resultCode: 1,
    error: {
      message: "Too many password reset attempts from this IP, please try again later."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Password reset rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      result: "error",
      resultCode: 1,
      error: {
        message: "Too many password reset attempts from this IP, please try again later."
      }
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  commentLimiter,
  passwordResetLimiter
};
