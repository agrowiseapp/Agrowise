// const axios = require("axios");

// const sendPushNotification = async (
//   deviceToken,
//   title,
//   body,
// ) => {
//   const fcmUrl = "https://fcm.googleapis.com/fcm/send";

//   // Prepare the request body
//   const requestBody = {
//     to: deviceToken,
//     notification: {
//       title: title,
//       body: body,
//       mutable_content: true,
//       sound: "Tri-tone",
//     },
//   };

//   // Set the headers
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization:
//       "key=AAAA5q6GeWI:APA91bEL4b8ZKAu18OoeNSs2tSLeern6I4rLMUKPExmkIs6h_2_M264QgXPB5IqCM-f_VZYHUvM8OqgXaSBnInxgxS57fu_SKGm3AFVkj4VAGfQ8C-DjGO9xS7qD76ysxk005lwYIDKs", // Replace <Server_key> with your FCM server key
//   };

//   try {
//     // Send the push notification request
//     const response = await axios.post(fcmUrl, requestBody, { headers });

//     // Handle the response
//     console.log("Push notification sent:", response.data);
//   } catch (error) {
//     console.log("Error sending push notification:", error);
//   }
// };

// module.exports = sendPushNotification;

const jwt = require("jsonwebtoken");
const fs = require("fs");
const axios = require("axios");
const http2 = require("http2"); // Import http2 module
const path = require("path");
const { google } = require("googleapis");
const { JWT } = google.auth;

const sendPushNotification = async (deviceToken, title, body, deviceType) => {
  //OLD WITHOUT PUSH V2
  // if (deviceType === 1) {
  //   // Android device - Use FCM
  //   const fcmUrl = "https://fcm.googleapis.com/fcm/send";

  //   // Prepare the request body for Android
  //   const requestBody = {
  //     to: deviceToken,
  //     notification: {
  //       title: title,
  //       body: body,
  //       mutable_content: true,
  //       sound: "Tri-tone",
  //     },
  //   };

  //   // Set the headers for Android
  //   const headers = {
  //     "Content-Type": "application/json",
  //     Authorization:
  //       "key=AAAA5q6GeWI:APA91bEL4b8ZKAu18OoeNSs2tSLeern6I4rLMUKPExmkIs6h_2_M264QgXPB5IqCM-f_VZYHUvM8OqgXaSBnInxgxS57fu_SKGm3AFVkj4VAGfQ8C-DjGO9xS7qD76ysxk005lwYIDKs", // Replace with your FCM server key
  //   };

  //   try {
  //     // Send the push notification request for Android
  //     const response = await axios.post(fcmUrl, requestBody, { headers });

  //     // Handle the response
  //     console.log("Push notification sent for Android:", response.data);
  //   } catch (error) {
  //     console.log("Error sending push notification for Android:", error);
  //   }
  // }

  if (deviceType === 1) {
    // Android device
    const fcmUrl =
      "https://fcm.googleapis.com/v1/projects/agrowise-5e376/messages:send";

    // Prepare the request body for Android
    const requestBody = {
      message: {
        token: deviceToken,
        notification: {
          title: title,
          body: body,
        },
        android: {
          notification: {
            sound: "default",
          },
        },
      },
    };

    // Set the headers for Android
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getAccessToken()}`, // Retrieve the OAuth 2.0 access token
    };

    try {
      await axios.post(fcmUrl, requestBody, { headers });
      console.log("📱 Push: Android notification sent successfully");
    } catch (error) {
      console.log(`❌ Push: Android notification failed - ${error.message}`);
    }
  } else if (deviceType === 2) {
    // iOS device - Use APNs

    // Generate the APNs JWT token
    const authorizationToken = generateAPNsToken();

    const client = http2.connect(
      "https://api.push.apple.com" // Use the production URL for iOS
    );

    const request = client.request({
      ":method": "POST",
      ":scheme": "https",
      "apns-topic": "aggro.application", // Replace with your app's bundle identifier
      ":path": "/3/device/" + deviceToken,
      authorization: `bearer ${authorizationToken}`, // Use the JSON web token generated for APNs
    });
    request.setEncoding("utf8");

    request.write(
      JSON.stringify({
        aps: {
          alert: {
            title: title,
            body: body,
          },
        },
        // Add other relevant data for iOS push notification payload if needed
      })
    );

    try {
      request.end();
      console.log("🍎 Push: iOS notification sent successfully");
    } catch (error) {
      console.log(`❌ Push: iOS notification failed - ${error.message}`);
    }
  } else {
    console.log("Invalid device type:", deviceType);
  }
};

// Function to generate the APNs JWT token
const generateAPNsToken = () => {
  // Load your APNs private key (.p8 file)
  const privateKeyPath = path.join(
    __dirname,
    "../certificates/AuthKey_WHJ2P9LQZZ.p8"
  );

  const privateKey = fs.readFileSync(privateKeyPath, "utf8");

  // Set the APNs key ID and Apple Team ID
  const keyId = "WHJ2P9LQZZ";
  const teamId = "Y764S95366";

  // Generate the JWT token
  const token = jwt.sign(
    {
      iss: teamId,
      iat: Math.round(new Date().getTime() / 1000),
    },
    privateKey,
    {
      algorithm: "ES256",
      header: {
        alg: "ES256",
        kid: keyId,
      },
    }
  );

  return token;
};

const getAccessToken = async () => {
  try {
    console.log("🔑 Firebase: Reading credentials from environment variables");

    const keys = {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, ''),
    };

    if (!keys.client_email || !keys.private_key) {
      throw new Error("Missing Firebase credentials in environment variables");
    }

    console.log(`📧 Firebase: Using client email: ${keys.client_email}`);

    const client = new JWT({
      email: keys.client_email,
      key: keys.private_key,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });

    const token = await client.authorize();
    console.log("✅ Firebase: Authentication successful");
    return token.access_token;
  } catch (error) {
    console.log(`❌ Firebase: Authentication failed - ${error.message}`);
    throw error;
  }
};

module.exports = sendPushNotification;
