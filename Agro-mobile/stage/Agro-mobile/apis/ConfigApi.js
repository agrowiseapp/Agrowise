import { getBootstrapUrl } from "./settings/bootstrapUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Constants
const CONFIG_URL = "/api/config";
const CONFIG_CACHE_KEY = "appConfig";

// Get app configuration from backend
export async function getAppConfigApi() {
  const bootstrapUrl = getBootstrapUrl();
  const url = bootstrapUrl + CONFIG_URL;

  console.log("Fetching app config from:", url);

  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    // Add timeout to prevent hanging
    signal: AbortSignal.timeout(10000), // 10 second timeout
  });
}

// Load configuration with fallback to cache
export async function loadAppConfiguration() {
  try {
    // Try to get config from backend
    const response = await getAppConfigApi();

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      "Raw config response from backend:",
      JSON.stringify(data, null, 2)
    );

    if (data?.resultCode === 0 && data?.response) {
      // Success - cache the config
      const config = data.response;

      // Ensure we have the required fields with fallbacks
      const processedConfig = {
        apiBaseUrl: config.apiBaseUrl || getBootstrapUrl(),
        imageBaseUrl: config.imageBaseUrl || "https://i.ibb.co",
        version: config.version || "1.0.0",
        appName: config.appName || "AgroWise",
        environment: config.environment || "development",
        features: {
          chatEnabled: config.features?.chatEnabled ?? true,
          notificationsEnabled: config.features?.notificationsEnabled ?? true,
        },
      };

      await AsyncStorage.setItem(
        CONFIG_CACHE_KEY,
        JSON.stringify(processedConfig)
      );
      console.log("App config loaded from backend:", processedConfig);
      return processedConfig;
    } else {
      console.log(
        "Invalid response format - resultCode:",
        data?.resultCode,
        "response:",
        data?.response
      );
      throw new Error("Invalid response format from backend");
    }
  } catch (error) {
    console.log("Failed to load config from backend:", error.message);

    // Fallback to cached config
    try {
      const cachedConfig = await AsyncStorage.getItem(CONFIG_CACHE_KEY);
      if (cachedConfig) {
        const config = JSON.parse(cachedConfig);
        console.log("Using cached app config:", config);
        return config;
      }
    } catch (cacheError) {
      console.log("Failed to load cached config:", cacheError.message);
    }

    // Final fallback - return bootstrap URL as config
    const fallbackConfig = {
      apiBaseUrl: getBootstrapUrl(),
      imageBaseUrl: "https://i.ibb.co",
      version: "1.0.0",
      appName: "AgroWise",
      environment: "development",
      features: {
        chatEnabled: true,
        notificationsEnabled: true,
      },
    };

    console.log("Using fallback config:", fallbackConfig);
    return fallbackConfig;
  }
}

// Get cached configuration
export async function getCachedAppConfig() {
  try {
    const cachedConfig = await AsyncStorage.getItem(CONFIG_CACHE_KEY);
    return cachedConfig ? JSON.parse(cachedConfig) : null;
  } catch (error) {
    console.log("Error loading cached config:", error);
    return null;
  }
}

// Clear cached configuration
export async function clearCachedAppConfig() {
  try {
    await AsyncStorage.removeItem(CONFIG_CACHE_KEY);
    console.log("Cached app config cleared");
  } catch (error) {
    console.log("Error clearing cached config:", error);
  }
}
