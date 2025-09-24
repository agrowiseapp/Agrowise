import { useState, useEffect } from 'react';
import AsyncStorage from '../utils/AsyncStorage';
import GoogleSignInService from '../services/GoogleSignInService';

export const useGoogleAuth = () => {
  const [googleUser, setGoogleUser] = useState(null);
  const [googleTokens, setGoogleTokens] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load stored Google user data on mount
  useEffect(() => {
    loadStoredGoogleAuth();
  }, []);

  const loadStoredGoogleAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('googleUser');
      const storedTokens = await AsyncStorage.getItem('googleTokens');

      if (storedUser && storedTokens) {
        setGoogleUser(JSON.parse(storedUser));
        setGoogleTokens(JSON.parse(storedTokens));
        setIsSignedIn(true);
      }
    } catch (error) {
      console.error('Error loading stored Google auth:', error);
    }
  };

  const signIn = async () => {
    try {
      setLoading(true);
      
      const result = await GoogleSignInService.signIn();
      
      if (result.success) {
        // Store user data and tokens
        await AsyncStorage.setItem('googleUser', JSON.stringify(result.user));
        await AsyncStorage.setItem('googleTokens', JSON.stringify(result.tokens));
        
        setGoogleUser(result.user);
        setGoogleTokens(result.tokens);
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

      // Revoke tokens if available
      if (googleTokens?.accessToken) {
        await GoogleSignInService.revokeAccess(googleTokens.accessToken);
      }

      // Clear local storage
      await AsyncStorage.removeItem('googleUser');
      await AsyncStorage.removeItem('googleTokens');
      
      // Clear state
      setGoogleUser(null);
      setGoogleTokens(null);
      setIsSignedIn(false);
      
      return { success: true };
    } catch (error) {
      console.error('Google Sign Out error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshTokens = async () => {
    try {
      if (!googleTokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      setLoading(true);
      
      const result = await GoogleSignInService.refreshTokens(googleTokens.refreshToken);
      
      if (result.success) {
        const newTokens = result.tokens;
        await AsyncStorage.setItem('googleTokens', JSON.stringify(newTokens));
        setGoogleTokens(newTokens);
        return { success: true, tokens: newTokens };
      } else {
        // If refresh fails, sign out the user
        await signOut();
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await signOut();
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Check if access token is expired and refresh if needed
  const ensureValidTokens = async () => {
    try {
      if (!googleTokens?.accessToken || !googleTokens?.expiresIn) {
        return { success: false, error: 'No valid tokens' };
      }

      // Check if token is expired (with 5 minute buffer)
      const expiryTime = new Date().getTime() + (googleTokens.expiresIn * 1000);
      const isExpired = new Date().getTime() > (expiryTime - 5 * 60 * 1000);

      if (isExpired) {
        console.log('Access token expired, refreshing...');
        return await refreshTokens();
      }

      return { success: true, tokens: googleTokens };
    } catch (error) {
      console.error('Error ensuring valid tokens:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    googleUser,
    googleTokens,
    isSignedIn,
    loading,
    signIn,
    signOut,
    refreshTokens,
    ensureValidTokens,
  };
};

export default useGoogleAuth;