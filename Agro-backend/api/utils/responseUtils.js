// responseUtils.js
const createResponse = (result, resultCode, message, response) => {
  //console.log("Response Returned :", result, resultCode, response);

  return {
    result,
    resultCode,
    message,
    response,
  };
};

module.exports = {
  createResponse,
};
