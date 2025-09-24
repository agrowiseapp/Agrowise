import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Complete the auth session in the browser
WebBrowser.maybeCompleteAuthSession();

class GoogleAuthExpoOfficial {
  constructor() {
    this.isConfigured = false;
    this.clientId =
      "990770526562-ilsmjhrc84o6c624qnvr502dmouv9ukr.apps.googleusercontent.com";

    // Force Expo proxy URL since makeRedirectUri isn't working correctly in dev builds
    this.redirectUri = "https://auth.expo.io/@agrowiseapp/agrowise";

    // Google OAuth 2.0 discovery document
    this.discovery = {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
      revocationEndpoint: "https://oauth2.googleapis.com/revoke",
    };

    console.log("🔧 GoogleAuthExpoOfficial initialized");
    console.log("🔗 Redirect URI:", this.redirectUri);
    console.log("📋 Client ID:", this.clientId);
  }

  /**
   * Configure Google Sign-In (following Expo docs pattern)
   */
  configure() {
    if (this.isConfigured) {
      return;
    }

    try {
      this.isConfigured = true;
      console.log("✅ Google Auth configured using Expo official pattern");
    } catch (error) {
      console.error("❌ Error configuring Google Auth:", error);
      throw error;
    }
  }

  /**
   * Create auth request using the official Expo pattern
   */
  createAuthRequest() {
    const request = new AuthSession.AuthRequest({
      clientId: this.clientId,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Code,
      redirectUri: this.redirectUri,
      additionalParameters: {
        prompt: "select_account",
        access_type: "offline",
      },
      // Enable PKCE for security (handled automatically by AuthSession)
      usePKCE: true,
    });

    return request;
  }

  /**
   * Sign in with Google using the official Expo AuthSession pattern
   */
  async signIn() {
    try {
      this.configure();

      console.log("🚀 Starting Google OAuth (Expo Official Pattern)...");
      console.log("📋 Client ID:", this.clientId);
      console.log("🔗 Redirect URI:", this.redirectUri);

      // Create the auth request
      const request = this.createAuthRequest();

      // Prompt for authentication
      const result = await request.promptAsync(this.discovery, {
        showInRecents: true,
        preferEphemeralSession: false, // Allow cookies to persist
      });

      console.log("📊 Auth result type:", result.type);
      console.log("📋 Full result:", JSON.stringify(result, null, 2));

      if (result.type === "success") {
        console.log("🎉 Authentication successful!");
        console.log(
          "📝 Authorization code received:",
          result.params.code ? "✅" : "❌"
        );

        // Exchange authorization code for tokens
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: this.clientId,
            code: result.params.code,
            redirectUri: this.redirectUri,
            extraParams: {
              code_verifier: request.codeChallenge,
            },
          },
          this.discovery
        );

        console.log("🎫 Token exchange successful!");
        console.log(
          "🔑 Access token received:",
          tokenResult.accessToken ? "✅" : "❌"
        );
        console.log("🆔 ID token received:", tokenResult.idToken ? "✅" : "❌");
        console.log(
          "🔄 Refresh token received:",
          tokenResult.refreshToken ? "✅" : "❌"
        );

        // Get user information
        const userInfo = await this.getUserInfo(tokenResult.accessToken);

        // Store tokens securely
        await this.storeTokens(tokenResult);

        return {
          success: true,
          user: {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture,
            givenName: userInfo.given_name,
            familyName: userInfo.family_name,
            verifiedEmail: userInfo.verified_email,
          },
          tokens: {
            accessToken: tokenResult.accessToken,
            refreshToken: tokenResult.refreshToken,
            idToken: tokenResult.idToken,
            expiresIn: tokenResult.expiresIn,
          },
        };
      } else if (result.type === "cancel") {
        console.log("🚫 User cancelled authentication");
        return {
          success: false,
          error: "User cancelled the authentication",
          code: "USER_CANCELLED",
        };
      } else if (result.type === "error") {
        console.error("❌ Authentication error:", result.error);
        return {
          success: false,
          error: result.error?.message || "Authentication failed",
          code: "AUTH_ERROR",
        };
      } else {
        console.error("❓ Unexpected result:", result.type);
        return {
          success: false,
          error: "Unexpected authentication result",
          code: "UNEXPECTED_RESULT",
        };
      }
    } catch (error) {
      console.error("💥 Google Sign-In error:", error);
      return {
        success: false,
        error: error.message || "Authentication failed",
        code: "EXCEPTION",
      };
    }
  }

  /**
   * Get user info from Google API
   */
  async getUserInfo(accessToken) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      const userInfo = await response.json();
      console.log("👤 User info retrieved:", userInfo.email);
      return userInfo;
    } catch (error) {
      console.error("❌ Error fetching user info:", error);
      throw error;
    }
  }

  /**
   * Store tokens using AsyncStorage (fallback for development)
   */
  async storeTokens(tokenResult) {
    try {
      await AsyncStorage.setItem(
        "google_access_token_official",
        tokenResult.accessToken
      );
      if (tokenResult.refreshToken) {
        await AsyncStorage.setItem(
          "google_refresh_token_official",
          tokenResult.refreshToken
        );
      }
      if (tokenResult.idToken) {
        await AsyncStorage.setItem(
          "google_id_token_official",
          tokenResult.idToken
        );
      }
      console.log("🔒 Tokens stored (Official approach)");
    } catch (error) {
      console.error("❌ Error storing tokens:", error);
    }
  }

  /**
   * Get stored tokens
   */
  async getStoredTokens() {
    try {
      const accessToken = await AsyncStorage.getItem(
        "google_access_token_official"
      );
      const refreshToken = await AsyncStorage.getItem(
        "google_refresh_token_official"
      );
      const idToken = await AsyncStorage.getItem("google_id_token_official");

      return {
        accessToken,
        refreshToken,
        idToken,
      };
    } catch (error) {
      console.error("❌ Error retrieving tokens:", error);
      return null;
    }
  }

  /**
   * Sign out and clear tokens
   */
  async signOut() {
    try {
      // Clear stored tokens
      await AsyncStorage.removeItem("google_access_token_official");
      await AsyncStorage.removeItem("google_refresh_token_official");
      await AsyncStorage.removeItem("google_id_token_official");

      console.log("✅ Google Sign-Out successful (Official)");
      return { success: true };
    } catch (error) {
      console.error("❌ Sign out error:", error);
      return {
        success: false,
        error: error.message || "Sign out failed",
      };
    }
  }

  /**
   * Check if user is signed in
   */
  async isSignedIn() {
    const tokens = await this.getStoredTokens();
    return !!(tokens && tokens.accessToken);
  }

  /**
   * Refresh access token
   */
  async refreshTokens() {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens || !tokens.refreshToken) {
        throw new Error("No refresh token available");
      }

      const result = await AuthSession.refreshAsync(
        {
          clientId: this.clientId,
          refreshToken: tokens.refreshToken,
        },
        this.discovery
      );

      // Store new tokens
      await this.storeTokens(result);

      return {
        success: true,
        tokens: result,
      };
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      return {
        success: false,
        error: error.message || "Token refresh failed",
      };
    }
  }
}

// Export singleton instance
export default new GoogleAuthExpoOfficial();
