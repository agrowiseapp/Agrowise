import { useState, useEffect } from 'react';
import GoogleAuthExpoOfficial from '../services/GoogleAuthExpoOfficial';

export const useGoogleAuthOfficial = () => {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user is signed in on mount
  useEffect(() => {
    checkSignInStatus();
  }, []);

  const checkSignInStatus = async () => {
    try {
      const signedIn = await GoogleAuthExpoOfficial.isSignedIn();
      setIsSignedIn(signedIn);
      
      if (signedIn) {
        // Get stored tokens and user info
        const tokens = await GoogleAuthExpoOfficial.getStoredTokens();
        if (tokens && tokens.accessToken) {
          const userInfo = await GoogleAuthExpoOfficial.getUserInfo(tokens.accessToken);
          setUser(userInfo);
        }
      }
    } catch (error) {
      console.error('Error checking sign-in status:', error);
    }
  };

  const signIn = async () => {
    try {
      setLoading(true);
      
      const result = await GoogleAuthExpoOfficial.signIn();
      
      if (result.success) {
        setUser(result.user);
        setIsSignedIn(true);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error, code: result.code };
      }
    } catch (error) {
      console.error('Google Sign In error in hook:', error);
      return { success: false, error: error.message, code: 'HOOK_ERROR' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const result = await GoogleAuthExpoOfficial.signOut();
      
      if (result.success) {
        setUser(null);
        setIsSignedIn(false);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Google Sign Out error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshTokens = async () => {
    try {
      const result = await GoogleAuthExpoOfficial.refreshTokens();
      return result;
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    isSignedIn,
    loading,
    signIn,
    signOut,
    refreshTokens,
    checkSignInStatus,
  };
};

export default useGoogleAuthOfficial;