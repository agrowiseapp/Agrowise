import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

class FirebaseAuthService {
  constructor() {
    this.isConfigured = false;
    // Web client ID from your google-services.json
    this.webClientId = '990770526562-ilsmjhrc84o6c624qnvr502dmouv9ukr.apps.googleusercontent.com';
  }

  /**
   * Configure Google Sign-In
   */
  configure() {
    if (this.isConfigured) {
      return;
    }

    try {
      GoogleSignin.configure({
        webClientId: this.webClientId,
        offlineAccess: true,
        forceCodeForRefreshToken: true, // Force refresh token
        accountName: '', // Don't use stored account
        iosClientId: this.webClientId, // Use same client ID for iOS
        hostedDomain: '', // No domain restriction
        loginHint: '', // No login hint
        includeServerAuthCode: true, // Include server auth code
        serverClientId: this.webClientId, // Server client ID
        profileImageSize: 120, // Profile image size
      });
      
      this.isConfigured = true;
      console.log('🔧 Firebase Google Sign-In configured successfully');
    } catch (error) {
      console.error('❌ Error configuring Google Sign-In:', error);
      throw error;
    }
  }

  /**
   * Sign in with Google using Firebase Authentication
   * @returns {Promise<Object>} User data and authentication result
   */
  async signInWithGoogle() {
    try {
      // Configure if not already done
      this.configure();

      console.log('🚀 Starting Firebase Google Sign-In...');

      // Check if device supports Google Play services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign out any existing user first to force account selection
      try {
        await GoogleSignin.signOut();
        console.log('🧹 Cleared previous Google session');
      } catch (signOutError) {
        console.log('⚠️ No previous session to clear');
      }

      // Get the user's ID token with forced account selection
      const signInResult = await GoogleSignin.signIn();
      console.log('✅ Google Sign-In successful');

      // Get the ID token - handle different versions of the library
      const idToken = signInResult.data?.idToken || signInResult.idToken;
      
      if (!idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const firebaseResult = await auth().signInWithCredential(googleCredential);
      
      console.log('🎉 Firebase authentication successful');
      console.log('👤 User:', firebaseResult.user.email);

      const user = firebaseResult.user;
      
      return {
        success: true,
        idToken: idToken, // Include idToken for backend authentication
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          providerId: 'google.com',
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
          }
        },
        firebaseUser: user,
        additionalUserInfo: firebaseResult.additionalUserInfo,
      };

    } catch (error) {
      console.error('❌ Google Sign-In failed:', error);
      
      if (error.code === 'sign_in_cancelled') {
        return {
          success: false,
          error: 'User cancelled the sign-in flow',
          code: 'USER_CANCELLED',
        };
      } else if (error.code === 'sign_in_required') {
        return {
          success: false,
          error: 'Sign-in required',
          code: 'SIGN_IN_REQUIRED',
        };
      } else if (error.code === 'play_services_not_available') {
        return {
          success: false,
          error: 'Google Play Services not available',
          code: 'PLAY_SERVICES_UNAVAILABLE',
        };
      } else {
        return {
          success: false,
          error: error.message || 'An unknown error occurred',
          code: 'UNKNOWN_ERROR',
        };
      }
    }
  }

  /**
   * Sign out from both Google and Firebase
   */
  async signOut() {
    try {
      console.log('🔄 Signing out...');

      // Sign out from Firebase first
      await auth().signOut();

      // Sign out from Google and revoke access to force account selection next time
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();

      console.log('✅ Sign out successful - access revoked');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Sign out failed',
      };
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return auth().currentUser;
  }

  /**
   * Check if user is signed in
   */
  isSignedIn() {
    return auth().currentUser !== null;
  }

  /**
   * Listen to authentication state changes
   * @param {Function} callback - Callback function to handle auth state changes
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged(callback) {
    return auth().onAuthStateChanged(callback);
  }

  /**
   * Delete user account
   */
  async deleteAccount() {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      // Sign out from Google first
      await GoogleSignin.signOut();
      
      // Delete the Firebase user account
      await user.delete();

      console.log('✅ Account deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Account deletion failed:', error);
      return {
        success: false,
        error: error.message || 'Account deletion failed',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profile) {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      await user.updateProfile(profile);
      
      console.log('✅ Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      return {
        success: false,
        error: error.message || 'Profile update failed',
      };
    }
  }

  /**
   * Get user's ID token (useful for backend authentication)
   */
  async getIdToken(forceRefresh = false) {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      const idToken = await user.getIdToken(forceRefresh);
      return { success: true, idToken };
    } catch (error) {
      console.error('❌ Failed to get ID token:', error);
      return {
        success: false,
        error: error.message || 'Failed to get ID token',
      };
    }
  }
}

// Export a singleton instance
export default new FirebaseAuthService();