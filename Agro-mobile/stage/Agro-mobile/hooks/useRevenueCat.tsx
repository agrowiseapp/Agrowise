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

  let isProMember =
    customerInfo?.activeSubscriptions.includes(typesOfMembership.monthly) ||
    customerInfo?.activeSubscriptions.includes(typesOfMembership.yearly);

  console.log("isPRoMember : ", isProMember);
  console.log(
    "Development Mode: ",
    shouldBypassPayments() ? "ON - Payments Bypassed" : "OFF - Payments Enabled"
  );

  // 2) useEffects
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if we should bypass payments in development
        if (shouldBypassPayments()) {
          console.log("🚀 DEVELOPMENT MODE: Bypassing RevenueCat payments");
          console.log("🎯 Mock subscription data enabled");

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
          return;
        }

        // Normal RevenueCat flow for production
        // await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        if (Platform.OS == "android") {
          console.log("Subscription : Trying to configure Android Device..");
          await Purchases.configure({ apiKey: apiKeys.google });

          const offerings = await Purchases.getOfferings();
          const customerInfo = await Purchases.getCustomerInfo();

          //console.log("CustomerInfo : ", customerInfo);
          //console.log("offerings : ", offerings.current);

          setcustomerInfo(customerInfo);
          setcurrentOffering(offerings.current);
        } else {
          await Purchases.configure({ apiKey: apiKeys.apple });
          console.log("Subscription : Trying to configure iOS Device..");

          const offerings = await Purchases.getOfferings();
          const customerInfo = await Purchases.getCustomerInfo();

          //console.log("CustomerInfo : ", customerInfo);
          //console.log("offerings : ", offerings.all.Monthly.availablePackages);

          setcustomerInfo(customerInfo);
          setcurrentOffering(offerings.current);
        }
      } catch (error) {
        console.log("Hook Error : ", JSON.stringify(error));
        console.log("Hook Error : ", error);
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
    isDevelopmentMode: shouldBypassPayments(),
  };
}

export default useRevenueCat;
