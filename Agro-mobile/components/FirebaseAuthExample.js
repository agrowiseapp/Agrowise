import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import useFirebaseAuth from '../hooks/useFirebaseAuth';

const FirebaseAuthExample = () => {
  const {
    user,
    initializing,
    loading,
    error,
    signInWithGoogle,
    signOut,
    deleteAccount,
    clearError,
    isSignedIn
  } = useFirebaseAuth();

  const handleGoogleSignIn = async () => {
    clearError();
    const result = await signInWithGoogle();
    
    if (result.success) {
      Alert.alert('Success', `Welcome ${result.user.displayName || result.user.email}!`);
    } else {
      Alert.alert('Sign In Failed', result.error);
    }
  };

  const handleSignOut = async () => {
    const result = await signOut();
    
    if (result.success) {
      Alert.alert('Success', 'You have been signed out');
    } else {
      Alert.alert('Sign Out Failed', result.error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteAccount();
            
            if (result.success) {
              Alert.alert('Success', 'Your account has been deleted');
            } else {
              Alert.alert('Deletion Failed', result.error);
            }
          },
        },
      ]
    );
  };

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#628479" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Google Authentication</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError} style={styles.clearErrorButton}>
            <Text style={styles.clearErrorText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {isSignedIn ? (
        <View style={styles.userContainer}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.userInfo}>Email: {user.email}</Text>
          {user.displayName && (
            <Text style={styles.userInfo}>Name: {user.displayName}</Text>
          )}
          <Text style={styles.userInfo}>UID: {user.uid}</Text>
          <Text style={styles.userInfo}>
            Email Verified: {user.emailVerified ? 'Yes' : 'No'}
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.signOutButton]}
            onPress={handleSignOut}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign Out</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.signInContainer}>
          <Text style={styles.description}>
            Sign in with your Google account to continue
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign in with Google</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#628479',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderColor: '#f44336',
    borderWidth: 1,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  clearErrorButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  clearErrorText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  userContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#628479',
    marginBottom: 20,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  signInContainer: {
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    minWidth: 200,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#4285f4',
  },
  signOutButton: {
    backgroundColor: '#628479',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FirebaseAuthExample;