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
  console.log(`🌐 returnUrl called with: "${url}"`);

  // If we already have a cached URL, use it
  if (isConfigLoaded()) {
    const config = getCachedConfig();
    const result = config?.apiBaseUrl || getBootstrapUrl();
    console.log(`✅ returnUrl using cached config:`, result);
    return result;
  }

  // If we're already loading config, wait for it
  if (configPromise) {
    console.log(`⏳ returnUrl waiting for existing config promise...`);
    await configPromise;
    const config = getCachedConfig();
    const result = config?.apiBaseUrl || getBootstrapUrl();
    console.log(`✅ returnUrl after waiting for promise:`, result);
    return result;
  }

  // If this is the first call, get the URL from backend
  if (url === "apiUrl") {
    console.log(`🔄 returnUrl loading new configuration...`);
    configPromise = loadConfiguration();
    await configPromise;
    const config = getCachedConfig();
    const result = config?.apiBaseUrl || getBootstrapUrl();
    console.log(`✅ returnUrl after loading config:`, result);
    return result;
  }

  console.log(`↩️ returnUrl returning original url: "${url}"`);
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
