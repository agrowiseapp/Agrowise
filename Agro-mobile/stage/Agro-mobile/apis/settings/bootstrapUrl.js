// Bootstrap URLs - these should be very stable and rarely change
const BOOTSTRAP_URLS = {
  development: "http://192.168.2.4:3001",
  production: "https://agrowise-application.onrender.com",
  staging: "https://agrowise-staging.onrender.com",
};

// Get the appropriate bootstrap URL based on environment
export const getBootstrapUrl = () => {
  // Method 1: Based on React Native development flag
  if (__DEV__) {
    return BOOTSTRAP_URLS.development;
  }

  // Method 2: Based on build configuration
  // You can set this in your build process
  const buildEnv = process.env.EXPO_PUBLIC_BUILD_ENV || "production";
  return BOOTSTRAP_URLS[buildEnv] || BOOTSTRAP_URLS.production;
};

// Configuration cache
let cachedConfig = null;
let configPromise = null;

// Get cached configuration
export const getCachedConfig = () => {
  return cachedConfig;
};

// Set cached configuration
export const setCachedConfig = (config) => {
  cachedConfig = config;
};

// Check if config is loaded
export const isConfigLoaded = () => {
  return cachedConfig !== null;
};

// Get the configuration promise (for waiting)
export const getConfigPromise = () => {
  return configPromise;
};
