// 1) Imports
const jwt = require("jsonwebtoken");

// 3) Exports

module.exports = async (req, res, next) => {
  try {
    console.log("Token Auth Started");

    const token = req.headers.authorization.split(" ")[1];
    const decoded = await jwt.verify(token, process.env.JWT_KEY);
    req.userData = decoded;
    //console.log("1) Error is here");

    next();
  } catch (error) {
    // console.log("2) Error is here : ", error);

    if (error instanceof jwt.TokenExpiredError) {
      //console.log("3) Error is here");

      // Token has expired
      const response = {
        result: "error",
        resultCode: 1,
        error: { message: "Token expired" },
      };
      return res.status(500).json(response);
    } else {
      console.log("4) Error is here : ", error);

      // Other JWT verification errors
      const response = {
        result: "error",
        resultCode: 1,
        error: { message: "Auth failed", error: error.message },
      };
      return res.status(401).json(response);
    }
  }
};
