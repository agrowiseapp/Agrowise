/**
 * AsyncStorage compatibility wrapper using Expo SecureStore
 * This provides the same API as @react-native-async-storage/async-storage
 * but uses Expo SecureStore under the hood for better compatibility with Expo SDK 54
 */

import * as SecureStore from 'expo-secure-store';

class AsyncStorageWrapper {
  /**
   * Get an item from storage
   * @param {string} key
   * @returns {Promise<string|null>}
   */
  static async getItem(key) {
    console.log(`🔍 AsyncStorage.getItem called with key: "${key}"`);
    try {
      const value = await SecureStore.getItemAsync(key);
      console.log(`✅ AsyncStorage.getItem success for "${key}":`, value ? `"${value.substring(0, 100)}..."` : 'null');
      return value;
    } catch (error) {
      // SecureStore throws error for missing keys, AsyncStorage returns null
      if (error.message?.includes('not found') || error.message?.includes('No such key')) {
        console.log(`ℹ️ AsyncStorage.getItem key "${key}" not found, returning null`);
        return null;
      }
      console.error(`❌ AsyncStorage.getItem error for "${key}":`, error);
      return null;
    }
  }

  /**
   * Set an item in storage
   * @param {string} key
   * @param {string} value
   * @returns {Promise<void>}
   */
  static async setItem(key, value) {
    console.log(`💾 AsyncStorage.setItem called with key: "${key}", value:`, typeof value === 'string' ? `"${value.substring(0, 100)}..."` : value);
    try {
      // Ensure value is a string
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await SecureStore.setItemAsync(key, stringValue);
      console.log(`✅ AsyncStorage.setItem success for "${key}"`);
    } catch (error) {
      console.error(`❌ AsyncStorage.setItem error for "${key}":`, error);
      throw error;
    }
  }

  /**
   * Remove an item from storage
   * @param {string} key
   * @returns {Promise<void>}
   */
  static async removeItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      // Don't throw error if key doesn't exist
      if (error.message?.includes('not found') || error.message?.includes('No such key')) {
        return;
      }
      console.error('AsyncStorage.removeItem error:', error);
      throw error;
    }
  }

  /**
   * Clear all items from storage
   * Note: SecureStore doesn't have a clear all method, so this is a no-op
   * Individual keys need to be removed manually if needed
   * @returns {Promise<void>}
   */
  static async clear() {
    console.warn('AsyncStorage.clear() is not supported with SecureStore backend. Remove items individually.');
    return Promise.resolve();
  }

  /**
   * Get all keys from storage
   * Note: SecureStore doesn't support getting all keys
   * @returns {Promise<string[]>}
   */
  static async getAllKeys() {
    console.warn('AsyncStorage.getAllKeys() is not supported with SecureStore backend.');
    return Promise.resolve([]);
  }

  /**
   * Get multiple items from storage
   * @param {string[]} keys
   * @returns {Promise<[string, string|null][]>}
   */
  static async multiGet(keys) {
    try {
      const results = await Promise.all(
        keys.map(async (key) => {
          const value = await this.getItem(key);
          return [key, value];
        })
      );
      return results;
    } catch (error) {
      console.error('AsyncStorage.multiGet error:', error);
      throw error;
    }
  }

  /**
   * Set multiple items in storage
   * @param {[string, string][]} keyValuePairs
   * @returns {Promise<void>}
   */
  static async multiSet(keyValuePairs) {
    try {
      await Promise.all(
        keyValuePairs.map(([key, value]) => this.setItem(key, value))
      );
    } catch (error) {
      console.error('AsyncStorage.multiSet error:', error);
      throw error;
    }
  }

  /**
   * Remove multiple items from storage
   * @param {string[]} keys
   * @returns {Promise<void>}
   */
  static async multiRemove(keys) {
    try {
      await Promise.all(
        keys.map((key) => this.removeItem(key))
      );
    } catch (error) {
      console.error('AsyncStorage.multiRemove error:', error);
      throw error;
    }
  }
}

export default AsyncStorageWrapper;