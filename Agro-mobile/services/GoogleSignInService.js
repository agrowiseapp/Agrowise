import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

// Complete the auth session in the browser
WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "agrowise",
  path: "redirect",
});

class GoogleSignInService {
  constructor() {
    this.isConfigured = false;
    this.androidClientId =
      "990770526562-eop4oa0n1p3krv5f1d5526p9fa8s6n5t.apps.googleusercontent.com";
    this.iosClientId =
      "990770526562-kr21jdh8lfe9u3ospc69aq101084o5j1.apps.googleusercontent.com";
    this.webClientId =
      "990770526562-ilsmjhrc84o6c624qnvr502dmouv9ukr.apps.googleusercontent.com"; // Web client that works with Expo proxy
    // Use Expo proxy for both dev and production to work with web client
    this.redirectUri = redirectUri;

    //     Android : 990770526562-evnurvnbchnamickvau0fiq0ban0ifeb.apps.googleusercontent.com
    // IOS : 990770526562-kr21jdh8lfe9u3ospc69aq101084o5j1.apps.googleusercontent.com

    // Google OAuth endpoints
    this.discovery = {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
      revocationEndpoint: "https://oauth2.googleapis.com/revoke",
    };
  }

  /**
   * Configure Google Sign-In
   */
  configure() {
    if (this.isConfigured) {
      return;
    }

    try {
      this.isConfigured = true;
      console.log("Google Sign-In configured successfully for Expo");
      console.log("Redirect URI:", this.redirectUri);
    } catch (error) {
      console.error("Error configuring Google Sign-In:", error);
      throw error;
    }
  }

  /**
   * Create auth request with PKCE
   */
  createAuthRequest() {
    return AuthSession.useAuthRequest(
      {
        clientId: this.webClientId,
        scopes: ["openid", "profile", "email"],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: this.redirectUri,
        additionalParameters: {},
        extraParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
      this.discovery
    );
  }

  /**
   * Sign in with Google using AuthSession
   * @returns {Promise<Object>} User data and tokens
   */
  async signIn() {
    try {
      // Configure if not already done
      this.configure();

      // Warm up the browser on Android
      if (Platform.OS === "android") {
        await WebBrowser.warmUpAsync();
      }

      console.log("🚀 Starting Google OAuth flow...");
      console.log("📋 Client ID:", this.webClientId);
      console.log("🔗 Redirect URI:", this.redirectUri);
      console.log(`🎯 Environment: ${__DEV__ ? "Development" : "Production"}`);
      console.log(`📱 URI Type: Expo Proxy (works with web client)`);

      // Generate PKCE codes
      const { codeVerifier, codeChallenge } =
        await this._generateCodeChallenge();

      // Create the auth request with PKCE
      const request = new AuthSession.AuthRequest({
        clientId: this.webClientId,
        scopes: ["openid", "profile", "email"],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: this.redirectUri,
        additionalParameters: {
          access_type: "offline",
          prompt: "select_account",
        },
        codeChallenge: codeChallenge,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
      });

      // Store the code verifier for later use
      request.codeVerifier = codeVerifier;

      // Start the auth session with timeout
      const result = await request.promptAsync(this.discovery, {
        timeoutInterval: 30000, // 30 second timeout
      });

      console.log("✅ Auth session result:", result.type);
      console.log("📋 Full result:", JSON.stringify(result, null, 2));

      if (result.type === "success") {
        console.log("🎉 Auth successful! Params:", Object.keys(result.params));
      } else if (result.type === "error") {
        console.log("❌ Auth error:", result.error);
      } else if (result.type === "cancel") {
        console.log("🚫 User cancelled");
      } else if (result.type === "dismiss") {
        console.log("📱 Modal dismissed");
      } else {
        console.log("❓ Unexpected result type:", result.type);
      }

      if (result.type === "success") {
        console.log(
          "🔄 Authorization successful, exchanging code for tokens..."
        );
        console.log(
          "📝 Code received:",
          result.params.code ? "✅ Present" : "❌ Missing"
        );
        console.log(
          "🔐 Code verifier:",
          request.codeVerifier ? "✅ Present" : "❌ Missing"
        );

        // Exchange the authorization code for tokens
        try {
          const tokenResult = await AuthSession.exchangeCodeAsync(
            {
              clientId: this.webClientId,
              code: result.params.code,
              redirectUri: this.redirectUri,
              codeVerifier: request.codeVerifier,
            },
            this.discovery
          );

          console.log("🎉 Token exchange successful!");
          console.log(
            "🎫 Access token:",
            tokenResult.accessToken ? "✅ Present" : "❌ Missing"
          );
          console.log(
            "🆔 ID token:",
            tokenResult.idToken ? "✅ Present" : "❌ Missing"
          );

          // Get user info from Google
          const userInfo = await this._getUserInfo(tokenResult.accessToken);
          console.log("👤 User info retrieved:", userInfo.email || "No email");
        } catch (tokenError) {
          console.error("❌ Token exchange failed:", tokenError);
          console.error("📋 Error details:", {
            message: tokenError.message,
            status: tokenError.status,
            response: tokenError.response,
          });
          throw tokenError;
        }

        return {
          success: true,
          user: {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            photo: userInfo.picture,
            givenName: userInfo.given_name,
            familyName: userInfo.family_name,
            verifiedEmail: userInfo.verified_email,
          },
          tokens: {
            accessToken: tokenResult.accessToken,
            refreshToken: tokenResult.refreshToken,
            idToken: tokenResult.idToken,
            tokenType: tokenResult.tokenType,
            expiresIn: tokenResult.expiresIn,
          },
        };
      } else if (result.type === "cancel") {
        console.log("User cancelled the authentication");
        return {
          success: false,
          error: "User cancelled the login flow",
          code: "USER_CANCELLED",
        };
      } else if (result.type === "error") {
        console.error("Auth session error:", result.error);
        return {
          success: false,
          error: result.error?.message || "Authentication failed",
          code: "AUTH_ERROR",
        };
      } else {
        console.error("Unexpected result type:", result.type);
        return {
          success: false,
          error: "Authentication failed - unexpected result",
          code: "UNKNOWN_ERROR",
        };
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      return {
        success: false,
        error: error.message || "An unknown error occurred",
        code: "EXCEPTION",
      };
    } finally {
      // Cool down the browser on Android
      if (Platform.OS === "android") {
        WebBrowser.coolDownAsync();
      }
    }
  }

  /**
   * Refresh the access token
   * @param {string} refreshToken - The refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshTokens(refreshToken) {
    try {
      const tokenResult = await AuthSession.refreshAsync(
        {
          clientId: this.webClientId,
          refreshToken: refreshToken,
        },
        this.discovery
      );

      return {
        success: true,
        tokens: {
          accessToken: tokenResult.accessToken,
          refreshToken: tokenResult.refreshToken || refreshToken, // Use old refresh token if new one not provided
          idToken: tokenResult.idToken,
          tokenType: tokenResult.tokenType,
          expiresIn: tokenResult.expiresIn,
        },
      };
    } catch (error) {
      console.error("Token refresh error:", error);
      return {
        success: false,
        error: error.message || "Token refresh failed",
        code: "REFRESH_ERROR",
      };
    }
  }

  /**
   * Revoke the access token
   * @param {string} accessToken - The access token to revoke
   */
  async revokeAccess(accessToken) {
    try {
      await AuthSession.revokeAsync(
        {
          clientId: this.webClientId,
          token: accessToken,
        },
        this.discovery
      );

      return {
        success: true,
      };
    } catch (error) {
      console.error("Token revocation error:", error);
      return {
        success: false,
        error: error.message || "Token revocation failed",
      };
    }
  }

  /**
   * Sign out (just clears local state, tokens need to be revoked separately)
   */
  async signOut() {
    try {
      console.log("Google Sign-Out successful");
      return { success: true };
    } catch (error) {
      console.error("Google Sign-Out error:", error);
      return {
        success: false,
        error: error.message || "Sign out failed",
      };
    }
  }

  /**
   * Generate PKCE code verifier and challenge
   * @private
   */
  async _generateCodeChallenge() {
    // Generate a random code verifier using a simpler approach
    const randomBytes = await Crypto.getRandomBytesAsync(32);

    // Convert Uint8Array to base64 string using a reliable method
    const byteArray = Array.from(randomBytes);
    const binaryString = byteArray
      .map((byte) => String.fromCharCode(byte))
      .join("");
    const base64String = btoa(binaryString);

    // Convert to base64url
    const codeVerifier = base64String
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    // Create challenge from verifier using SHA256
    const challengeBase64 = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );

    // Convert BASE64 to BASE64URL
    const codeChallenge = challengeBase64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    console.log("🔐 Generated PKCE codes:", {
      codeVerifier: codeVerifier.substring(0, 10) + "...",
      codeVerifierLength: codeVerifier.length,
      codeChallenge: codeChallenge.substring(0, 10) + "...",
      codeChallengeLength: codeChallenge.length,
    });

    return { codeVerifier, codeChallenge };
  }

  /**
   * Get user info from Google API
   * @private
   */
  async _getUserInfo(accessToken) {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch user info: ${response.status} - ${errorText}`
      );
    }

    return await response.json();
  }

  // Legacy methods for backward compatibility
  async getCurrentUser() {
    return {
      success: false,
      error: "getCurrentUser not supported - use token-based auth",
      user: null,
    };
  }

  async isSignedIn() {
    return false; // Implement based on stored tokens if needed
  }
}

// Export a singleton instance
export default new GoogleSignInService();
