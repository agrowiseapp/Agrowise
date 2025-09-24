// Development Configuration
// Set this to true to bypass RevenueCat payments during development
export const DEVELOPMENT_MODE = __DEV__;

// Development settings
export const DEV_CONFIG = {
  // Bypass RevenueCat payments in development
  BYPASS_PAYMENTS: DEVELOPMENT_MODE,

  // Mock subscription data for development
  MOCK_SUBSCRIPTION: {
    isProMember: true,
    activeSubscriptions: ["month_subscription", "year_sub:1-year-sub-plan"],
    customerInfo: {
      activeSubscriptions: ["month_subscription", "year_sub:1-year-sub-plan"],
      allPurchasedProductIdentifiers: [
        "month_subscription",
        "year_sub:1-year-sub-plan",
      ],
      latestExpirationDate: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(), // 1 year from now
    },
  },

  // Development API settings
  API_TIMEOUT: 10000,
  LOG_LEVEL: "debug",

  // Feature flags for development
  FEATURES: {
    ENABLE_PAYMENTS: !DEVELOPMENT_MODE,
    ENABLE_ANALYTICS: !DEVELOPMENT_MODE,
    ENABLE_CRASH_REPORTING: !DEVELOPMENT_MODE,
  },
};

// Helper function to check if we're in development mode
export const isDevelopment = () => DEVELOPMENT_MODE;

// Helper function to check if payments should be bypassed
export const shouldBypassPayments = () => DEV_CONFIG.BYPASS_PAYMENTS;
