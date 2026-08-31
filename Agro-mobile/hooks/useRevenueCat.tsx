import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
} from "react-native-purchases";
import AsyncStorage from "../utils/AsyncStorage";
import { shouldBypassPayments } from "../config/development";

const apiKeys = {
  apple: "appl_iHBaMkvYZtnfABlZmnoUiBCvyWg",
  google: "goog_HebjUdWBpExdewTmdTAqvSozXba",
};

/** Storage key holding the last CONFIRMED entitlement answer from RevenueCat. */
export const PRO_CACHE_KEY = "rcEntitlementCache";

/** Legacy flag the content screens still read. Kept in sync with the above. */
const LEGACY_PRO_KEY = "ProMembership";

/**
 * Single source of truth for "is this user a paying member".
 *
 * Deliberately does NOT hardcode an entitlement identifier or a product id.
 * Any active entitlement, or any active subscription, counts as Pro. This
 * keeps the check correct regardless of how the RevenueCat dashboard is
 * configured, and works on Google Play (which reports the bare product id,
 * never "productId:basePlanId").
 */
export const isProCustomer = (info: CustomerInfo | null | undefined): boolean => {
  if (!info) return false;
  const activeEntitlements = Object.keys(info.entitlements?.active ?? {});
  if (activeEntitlements.length > 0) return true;
  return (info.activeSubscriptions?.length ?? 0) > 0;
};

/** Configure the SDK exactly once per process. */
let configurePromise: Promise<void> | null = null;
const ensureConfigured = async () => {
  if (!configurePromise) {
    configurePromise = (async () => {
      const alreadyConfigured = await Purchases.isConfigured();
      if (!alreadyConfigured) {
        const apiKey =
          Platform.OS === "android" ? apiKeys.google : apiKeys.apple;
        await Purchases.configure({ apiKey });
      }
    })().catch((error) => {
      // Allow a later attempt to retry configuration.
      configurePromise = null;
      throw error;
    });
  }
  return configurePromise;
};

/**
 * access:
 *   "loading" - we do not know yet, show a loader, never the paywall
 *   "pro"     - full app
 *   "free"    - paywall / guest mode
 */
export type EntitlementAccess = "loading" | "pro" | "free";

function useRevenueCat() {
  const [currentOffering, setcurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const [customerInfo, setcustomerInfo] = useState<CustomerInfo | null>(null);
  const [access, setAccess] = useState<EntitlementAccess>("loading");
  /** True when RevenueCat could not be reached and we fell back to cache. */
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);

  const mounted = useRef(true);

  /** Record a CONFIRMED answer so a later outage can fall back to it. */
  const applyCustomerInfo = useCallback(async (info: CustomerInfo | null) => {
    const pro = isProCustomer(info);
    if (mounted.current) {
      setcustomerInfo(info);
      setAccess(pro ? "pro" : "free");
      setIsOfflineFallback(false);
    }
    try {
      await AsyncStorage.setItem(PRO_CACHE_KEY, pro ? "true" : "false");
      // Keep the legacy flag in sync. Screens (News, Chat, Profile) still gate
      // their content on it, and it used to be written only during login -
      // so a user who subscribed mid-session kept seeing trial content.
      await AsyncStorage.setItem(LEGACY_PRO_KEY, pro ? "true" : "false");
    } catch (e) {
      // Cache is a nice-to-have; never block on it.
    }
  }, []);

  /**
   * FAIL OPEN. If RevenueCat is unreachable we must never lock out someone
   * who has already paid, so we trust the last confirmed answer instead.
   */
  const fallBackToCache = useCallback(async () => {
    let cached: string | null = null;
    try {
      cached = await AsyncStorage.getItem(PRO_CACHE_KEY);
    } catch (e) {
      cached = null;
    }
    if (!mounted.current) return;
    setIsOfflineFallback(true);
    setAccess(cached === "true" ? "pro" : "free");
  }, []);

  const refresh = useCallback(async () => {
    if (shouldBypassPayments()) {
      if (mounted.current) {
        setAccess("pro");
        setcurrentOffering(null);
      }
      await AsyncStorage.setItem(LEGACY_PRO_KEY, "true").catch(() => {});
      return;
    }

    try {
      await ensureConfigured();
      const [offerings, info] = await Promise.all([
        Purchases.getOfferings(),
        Purchases.getCustomerInfo(),
      ]);
      if (mounted.current) setcurrentOffering(offerings.current);
      await applyCustomerInfo(info);
    } catch (error) {
      console.log("RevenueCat unavailable, using cached entitlement");
      await fallBackToCache();
    }
  }, [applyCustomerInfo, fallBackToCache]);

  /** Apple requires a user-triggered restore path for auto-renewing subs. */
  const restorePurchases = useCallback(async () => {
    try {
      await ensureConfigured();
      const info = await Purchases.restorePurchases();
      await applyCustomerInfo(info);
      return { success: true, isPro: isProCustomer(info) };
    } catch (error: any) {
      return {
        success: false,
        isPro: false,
        userCancelled: !!error?.userCancelled,
      };
    }
  }, [applyCustomerInfo]);

  useEffect(() => {
    mounted.current = true;
    refresh();
    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  // Entitlement changes pushed by the SDK (renewal, expiry, purchase).
  useEffect(() => {
    if (shouldBypassPayments()) return;

    const listener = (info: CustomerInfo) => {
      applyCustomerInfo(info);
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [applyCustomerInfo]);

  return {
    currentOffering,
    customerInfo,
    access,
    isProMember: access === "pro",
    isLoadingEntitlement: access === "loading",
    isOfflineFallback,
    restorePurchases,
    refresh,
    /** Call with the CustomerInfo returned by a successful purchase. */
    onPurchaseComplete: applyCustomerInfo,
    isDevelopmentMode: shouldBypassPayments(),
  };
}

export default useRevenueCat;
