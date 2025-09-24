// 1) Imports
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

// 2) Google OAuth Configuration
const GOOGLE_CLIENT_ID =
  "990770526562-ilsmjhrc84o6c624qnvr502dmouv9ukr.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// 3) Verify Google ID Token
async function verifyGoogleToken(idToken) {
  try {
    console.log("Verifying Google token...");

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("Google token verified successfully");

    return {
      success: true,
      userInfo: {
        googleId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        profilePicture: payload.picture,
        emailVerified: payload.email_verified,
      },
    };
  } catch (error) {
    console.log("Google token verification failed:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// 4) Export
module.exports = {
  verifyGoogleToken,
};
