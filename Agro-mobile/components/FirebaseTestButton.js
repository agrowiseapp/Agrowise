import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const FirebaseTestButton = () => {
  const testFirebaseConnection = async () => {
    try {
      console.log('🧪 Testing Firebase connection...');
      
      // Test Firebase app initialization
      const app = auth().app;
      console.log('✅ Firebase app name:', app.name);
      console.log('✅ Firebase app options:', app.options);
      
      // Test current auth state
      const currentUser = auth().currentUser;
      console.log('👤 Current user:', currentUser ? currentUser.email : 'No user');
      
      // Test auth state listener
      const unsubscribe = auth().onAuthStateChanged((user) => {
        console.log('🔄 Auth state changed:', user ? user.email : 'No user');
        unsubscribe(); // Unsubscribe immediately after first call
      });
      
      Alert.alert(
        'Firebase Test',
        `Firebase is connected!\nApp: ${app.name}\nUser: ${currentUser ? currentUser.email : 'Not signed in'}`
      );
      
    } catch (error) {
      console.error('❌ Firebase test failed:', error);
      Alert.alert('Firebase Test Failed', error.message);
    }
  };

  return (
    <TouchableOpacity
      onPress={testFirebaseConnection}
      style={{
        backgroundColor: '#FF6B35',
        padding: 15,
        borderRadius: 8,
        margin: 10,
      }}
    >
      <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        🧪 Test Firebase Connection
      </Text>
    </TouchableOpacity>
  );
};

export default FirebaseTestButton;