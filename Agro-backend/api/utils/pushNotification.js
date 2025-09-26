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
    console.log("🔑 Firebase: Starting authentication process");
    console.log("🔍 Firebase: Checking environment variables...");
    
    // Debug environment variables
    console.log(`🔍 Firebase: FIREBASE_CLIENT_EMAIL exists: ${!!process.env.FIREBASE_CLIENT_EMAIL}`);
    console.log(`🔍 Firebase: FIREBASE_PRIVATE_KEY exists: ${!!process.env.FIREBASE_PRIVATE_KEY}`);
    
    if (process.env.FIREBASE_CLIENT_EMAIL) {
      console.log(`🔍 Firebase: Client email value: ${process.env.FIREBASE_CLIENT_EMAIL}`);
    }
    
    if (process.env.FIREBASE_PRIVATE_KEY) {
      console.log(`🔍 Firebase: Private key length (raw): ${process.env.FIREBASE_PRIVATE_KEY.length} characters`);
      console.log(`🔍 Firebase: Private key starts with: "${process.env.FIREBASE_PRIVATE_KEY.substring(0, 50)}..."`);
      console.log(`🔍 Firebase: Private key ends with: "...${process.env.FIREBASE_PRIVATE_KEY.substring(process.env.FIREBASE_PRIVATE_KEY.length - 50)}"`);
      console.log(`🔍 Firebase: Contains \\n sequences: ${process.env.FIREBASE_PRIVATE_KEY.includes('\\n')}`);
      console.log(`🔍 Firebase: Contains actual newlines: ${process.env.FIREBASE_PRIVATE_KEY.includes('\n')}`);
      console.log(`🔍 Firebase: Contains BEGIN PRIVATE KEY: ${process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')}`);
    }

    // Try to read from environment variables first (for Railway deployment)
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      console.log("📧 Firebase: Using environment variables");
      
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      console.log("🔧 Firebase: Starting private key processing...");

      // Handle different possible formats of the private key in environment variables
      if (privateKey) {
        console.log("🔧 Firebase: Step 1 - Replacing literal \\n with actual newlines");
        const beforeNewlines = privateKey.length;
        privateKey = privateKey.replace(/\\n/g, '\n');
        console.log(`🔧 Firebase: After newline replacement: ${beforeNewlines} → ${privateKey.length} characters`);
        console.log(`🔧 Firebase: Now contains actual newlines: ${privateKey.includes('\n')}`);

        // If the key doesn't start with BEGIN, it might be base64 encoded
        if (!privateKey.includes('BEGIN PRIVATE KEY')) {
          console.log("🔧 Firebase: Step 2 - Key doesn't contain BEGIN, trying base64 decode");
          try {
            const beforeBase64 = privateKey.length;
            privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
            console.log(`🔧 Firebase: Base64 decode successful: ${beforeBase64} → ${privateKey.length} characters`);
            console.log(`🔧 Firebase: After base64 decode, starts with: "${privateKey.substring(0, 50)}..."`);
          } catch (e) {
            console.log("🔧 Firebase: Private key is not base64 encoded");
            console.log(`🔧 Firebase: Base64 decode error: ${e.message}`);
          }
        } else {
          console.log("🔧 Firebase: Step 2 - Key already contains BEGIN PRIVATE KEY, skipping base64 decode");
        }

        // Ensure proper formatting
        if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
          console.log("🔧 Firebase: Step 3 - Adding proper BEGIN/END headers");
          const beforeHeaders = privateKey.length;
          privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
          console.log(`🔧 Firebase: After adding headers: ${beforeHeaders} → ${privateKey.length} characters`);
        } else {
          console.log("🔧 Firebase: Step 3 - Key already has proper headers");
        }

        console.log(`🔧 Firebase: Final processed key length: ${privateKey.length} characters`);
        console.log(`🔧 Firebase: Final key starts with: "${privateKey.substring(0, 50)}..."`);
        console.log(`🔧 Firebase: Final key ends with: "...${privateKey.substring(privateKey.length - 50)}"`);
      }

      const keys = {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: privateKey,
      };

      console.log(`📧 Firebase: Final client email: ${keys.client_email}`);
      console.log(`🔐 Firebase: Final private key length: ${keys.private_key.length} characters`);

      // Validate key format
      const keyLines = keys.private_key.split('\n');
      console.log(`🔍 Firebase: Key has ${keyLines.length} lines`);
      console.log(`🔍 Firebase: First line: "${keyLines[0]}"`);
      console.log(`🔍 Firebase: Last line: "${keyLines[keyLines.length - 1]}"`);
      
      // Check for common issues
      if (!keys.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
        console.log("⚠️ Firebase: WARNING - Key missing BEGIN header");
      }
      if (!keys.private_key.includes('-----END PRIVATE KEY-----')) {
        console.log("⚠️ Firebase: WARNING - Key missing END header");
      }

      console.log("🔧 Firebase: Creating JWT client...");
      const client = new JWT({
        email: keys.client_email,
        key: keys.private_key,
        scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
      });

      console.log("🔧 Firebase: Attempting to authorize JWT client...");
      const token = await client.authorize();
      console.log("✅ Firebase: Authentication successful");
      console.log(`🔑 Firebase: Access token length: ${token.access_token.length} characters`);
      console.log(`🔑 Firebase: Token starts with: ${token.access_token.substring(0, 20)}...`);
      return token.access_token;
    } else {
      // Fallback to service account file
      console.log("📧 Firebase: Environment variables not found, using service account file");
      const serviceAccountPath = path.join(__dirname, "key/firebase-service-key.json");
      console.log(`📄 Firebase: Reading file: ${serviceAccountPath}`);
      
      const serviceAccount = require(serviceAccountPath);
      console.log(`📧 Firebase: File client email: ${serviceAccount.client_email}`);
      console.log(`🔐 Firebase: File private key length: ${serviceAccount.private_key.length} characters`);
      console.log(`🔐 Firebase: File private key starts with: "${serviceAccount.private_key.substring(0, 50)}..."`);

      console.log("🔧 Firebase: Creating JWT client from file...");
      const client = new JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
      });

      console.log("🔧 Firebase: Attempting to authorize JWT client from file...");
      const token = await client.authorize();
      console.log("✅ Firebase: Authentication successful with file");
      console.log(`🔑 Firebase: Access token length: ${token.access_token.length} characters`);
      return token.access_token;
    }
  } catch (error) {
    console.log(`❌ Firebase: Authentication failed - ${error.message}`);
    console.log(`🔍 Firebase: Error name: ${error.name}`);
    console.log(`🔍 Firebase: Error code: ${error.code}`);
    console.log(`🔍 Firebase: Error stack:`, error.stack);
    
    // Additional debugging for JWT errors
    if (error.message && error.message.includes('invalid_grant')) {
      console.log("🔍 Firebase: This is a JWT signature validation error");
      console.log("🔍 Firebase: Common causes:");
      console.log("   - Private key formatting issues");
      console.log("   - Mismatched client_email and private_key");
      console.log("   - Clock synchronization issues");
      console.log("   - Invalid service account permissions");
    }
    
    throw error;
  }
};

module.exports = sendPushNotification;
