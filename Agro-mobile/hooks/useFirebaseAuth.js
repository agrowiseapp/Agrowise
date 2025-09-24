import { useState, useEffect } from 'react';
import FirebaseAuthService from '../services/FirebaseAuthService';

const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? firebaseUser.email : 'No user');
      
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          metadata: {
            creationTime: firebaseUser.metadata.creationTime,
            lastSignInTime: firebaseUser.metadata.lastSignInTime,
          }
        });
      } else {
        setUser(null);
      }

      if (initializing) {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, [initializing]);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await FirebaseAuthService.signInWithGoogle();
      
      if (!result.success) {
        setError(result.error);
        return result;
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        code: 'UNEXPECTED_ERROR'
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await FirebaseAuthService.signOut();
      
      if (!result.success) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred during sign out';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await FirebaseAuthService.deleteAccount();
      
      if (!result.success) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred during account deletion';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profile) => {
    setLoading(true);
    setError(null);

    try {
      const result = await FirebaseAuthService.updateProfile(profile);
      
      if (!result.success) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred during profile update';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const getIdToken = async (forceRefresh = false) => {
    try {
      const result = await FirebaseAuthService.getIdToken(forceRefresh);
      
      if (!result.success) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred while getting ID token';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    initializing,
    loading,
    error,
    signInWithGoogle,
    signOut,
    deleteAccount,
    updateProfile,
    getIdToken,
    clearError,
    isSignedIn: !!user,
  };
};

export default useFirebaseAuth;