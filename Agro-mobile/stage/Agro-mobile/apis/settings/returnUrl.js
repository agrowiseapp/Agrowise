import {
  getBootstrapUrl,
  getCachedConfig,
  setCachedConfig,
  isConfigLoaded,
  getConfigPromise,
} from "./bootstrapUrl";
import { loadAppConfiguration } from "../ConfigApi";

let configPromise = null;

export const returnUrl = async (url) => {
  // If we already have a cached URL, use it
  if (isConfigLoaded()) {
    const config = getCachedConfig();
    return config?.apiBaseUrl || getBootstrapUrl();
  }

  // If we're already loading config, wait for it
  if (configPromise) {
    await configPromise;
    const config = getCachedConfig();
    return config?.apiBaseUrl || getBootstrapUrl();
  }

  // If this is the first call, get the URL from backend
  if (url === "apiUrl") {
    configPromise = loadConfiguration();
    await configPromise;
    const config = getCachedConfig();
    return config?.apiBaseUrl || getBootstrapUrl();
  }

  return url;
};

const loadConfiguration = async () => {
  try {
    console.log("Loading app configuration...");
    const config = await loadAppConfiguration();
    setCachedConfig(config);
    console.log("App configuration loaded successfully");
  } catch (error) {
    console.log("Error loading app configuration:", error);
    // Set fallback config
    const fallbackConfig = {
      apiBaseUrl: getBootstrapUrl(),
      imageBaseUrl: "https://i.ibb.co",
      version: "1.1.4",
      features: {
        chatEnabled: true,
        notificationsEnabled: true,
      },
    };
    setCachedConfig(fallbackConfig);
  }
};

// Export function to manually reload configuration
export const reloadConfiguration = async () => {
  configPromise = null;
  setCachedConfig(null);
  return loadConfiguration();
};
