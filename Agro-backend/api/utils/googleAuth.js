// 1) Imports
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

// 2) Google OAuth Configuration
const GOOGLE_CLIENT_ID =
  "990770526562-pflqupb4cdn44to3mmsu5ab4fvbjabb9.apps.googleusercontent.com";
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

    // Extract name parts with robust fallbacks
    // Priority: given_name -> name -> email username -> "User"
    let firstName = payload.given_name || payload.name;

    if (!firstName || firstName.trim() === "") {
      // If still no firstName, extract from email (part before @)
      firstName = payload.email ? payload.email.split("@")[0] : "User";
    }

    // For lastName: family_name -> given_name -> email username -> firstName
    let lastName = payload.family_name;

    if (!lastName || lastName.trim() === "") {
      lastName = payload.given_name || firstName;
    }

    // Final safety check - ensure neither is empty
    firstName = firstName && firstName.trim() !== "" ? firstName.trim() : "User";
    lastName = lastName && lastName.trim() !== "" ? lastName.trim() : "User";

    return {
      success: true,
      userInfo: {
        googleId: payload.sub,
        email: payload.email,
        firstName: firstName,
        lastName: lastName,
        profilePicture: payload.picture || "",
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
