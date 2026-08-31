import {
  getBootstrapUrl,
  getCachedConfig,
  setCachedConfig,
  isConfigLoaded,
} from "./bootstrapUrl";
import { loadAppConfiguration } from "../ConfigApi";

let configPromise = null;

const resolvedBaseUrl = () => {
  const config = getCachedConfig();
  return config?.apiBaseUrl || getBootstrapUrl();
};

export const returnUrl = async () => {
  // Already resolved once this session.
  if (isConfigLoaded()) {
    return resolvedBaseUrl();
  }

  // A load is already in flight - wait for that one instead of starting another.
  if (configPromise) {
    await configPromise;
    return resolvedBaseUrl();
  }

  // First call of the session: resolve the base URL.
  // NOTE: the argument is ignored on purpose. Callers historically passed
  // either "apiUrl" or "url"; anything other than "apiUrl" used to fall
  // through and return that literal string as the base URL, which broke the
  // notification-badge calls.
  configPromise = loadConfiguration();
  await configPromise;
  return resolvedBaseUrl();
};

const loadConfiguration = async () => {
  try {
    const config = await loadAppConfiguration();
    setCachedConfig(config);
  } catch (error) {
    console.log("Config load failed, using fallback base url");
    const fallbackConfig = {
      apiBaseUrl: getBootstrapUrl(),
      imageBaseUrl: "https://i.ibb.co",
      version: "1.1.6",
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
  setCachedConfig(null);
  configPromise = loadConfiguration();
  await configPromise;
  return resolvedBaseUrl();
};
