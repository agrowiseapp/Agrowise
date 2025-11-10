import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
} from "react-native-purchases";
import { DEV_CONFIG, shouldBypassPayments } from "../config/development";

const apiKeys = {
  apple: "appl_iHBaMkvYZtnfABlZmnoUiBCvyWg",
  google: "goog_HebjUdWBpExdewTmdTAqvSozXba",
};

const typesOfMembership = {
  monthly: "month_subscription",
  yearly: "year_sub:1-year-sub-plan",
};

function useRevenueCat() {
  //1) Data
  const [currentOffering, setcurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const [customerInfo, setcustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  let isProMember =
    customerInfo?.activeSubscriptions.includes(typesOfMembership.monthly) ||
    customerInfo?.activeSubscriptions.includes(typesOfMembership.yearly);

  console.log("isPRoMember : ", isProMember);
  console.log("RevenueCat Loading: ", isLoading);
  console.log(
    "Development Mode: ",
    shouldBypassPayments() ? "ON - Payments Bypassed" : "OFF - Payments Enabled"
  );

  // 2) useEffects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔄 RevenueCat: Starting initialization...");

        // Check if we should bypass payments in development
        if (shouldBypassPayments()) {
          console.log("🚀 RevenueCat: Using mock data (development mode)");

          // Set mock subscription data for development
          const mockCustomerInfo = {
            activeSubscriptions: [
              typesOfMembership.monthly,
              typesOfMembership.yearly,
            ],
            allPurchasedProductIdentifiers: [
              typesOfMembership.monthly,
              typesOfMembership.yearly,
            ],
            latestExpirationDate: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000
            ).toISOString(),
            originalAppUserId: "dev_user",
            originalApplicationVersion: "1.0.0",
            managementURL: null,
            nonSubscriptionTransactions: [],
            subscriptions: {},
            entitlements: {
              active: {
                pro_access: {
                  identifier: "pro_access",
                  isActive: true,
                  willRenew: true,
                  periodType: "normal",
                  latestPurchaseDate: new Date().toISOString(),
                  originalPurchaseDate: new Date().toISOString(),
                  expirationDate: new Date(
                    Date.now() + 365 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                  store: Platform.OS === "ios" ? "app_store" : "play_store",
                  productIdentifier: typesOfMembership.monthly,
                  isSandbox: true,
                  unsubscribeDetectedAt: null,
                  billingIssueDetectedAt: null,
                },
              },
              all: {},
              verification: "NOT_REQUESTED",
            },
            firstSeen: new Date().toISOString(),
            requestDate: new Date().toISOString(),
            allExpirationDates: {
              [typesOfMembership.monthly]: new Date(
                Date.now() + 365 * 24 * 60 * 60 * 1000
              ).toISOString(),
              [typesOfMembership.yearly]: new Date(
                Date.now() + 365 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
            allPurchaseDates: {
              [typesOfMembership.monthly]: new Date().toISOString(),
              [typesOfMembership.yearly]: new Date().toISOString(),
            },
            originalPurchaseDate: new Date().toISOString(),
          } as unknown as CustomerInfo;

          setcustomerInfo(mockCustomerInfo);
          setcurrentOffering(null); // No offerings needed in dev mode
          setIsLoading(false);
          console.log("✅ RevenueCat: Mock data loaded successfully");
          return;
        }

        // Normal RevenueCat flow for production
        console.log("🔧 RevenueCat: Configuring...");
        // await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        // Configure RevenueCat first (only if not already configured)
        const apiKey = Platform.OS === "android" ? apiKeys.google : apiKeys.apple;

        try {
          // Check if already configured by trying to get customer info
          await Purchases.getCustomerInfo();
          console.log("✅ RevenueCat: Already configured");
        } catch (configError) {
          // Not configured yet, so configure now
          console.log("🔧 RevenueCat: Configuring for first time...");
          await Purchases.configure({ apiKey });
          console.log("✅ RevenueCat: Configuration complete");
        }

        // Now get offerings and customer info
        console.log("📦 RevenueCat: Fetching offerings and customer info...");
        const offerings = await Purchases.getOfferings();
        const customerInfo = await Purchases.getCustomerInfo();

        console.log("✅ RevenueCat: Customer info loaded");
        console.log("📊 RevenueCat: Active subscriptions:", customerInfo.activeSubscriptions);

        setcustomerInfo(customerInfo);
        setcurrentOffering(offerings.current);
        setIsLoading(false);
        console.log("✅ RevenueCat: Initialization complete");
      } catch (error) {
        console.error("❌ RevenueCat Error: ", error);
        console.error("❌ RevenueCat Error (JSON): ", JSON.stringify(error));
        setError(error instanceof Error ? error.message : "Unknown error");
        setIsLoading(false);

        // Set customerInfo to empty state so isProMember becomes false
        setcustomerInfo(null);
      }
    };

    fetchData().catch(console.error);
  }, []);

  useEffect(() => {
    // Only add listener if not in development mode
    if (!shouldBypassPayments()) {
      const customerInfoUpdatedObject = async (purchaserInfo: CustomerInfo) => {
        //console.log("Customer Info Updating : ", purchaserInfo);
        setcustomerInfo(purchaserInfo);
      };

      Purchases.addCustomerInfoUpdateListener(customerInfoUpdatedObject);
    }
  }, []);

  return {
    currentOffering,
    customerInfo,
    isProMember,
    isLoading,
    error,
    isDevelopmentMode: shouldBypassPayments(),
  };
}

export default useRevenueCat;
