import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AuthStack } from "./AuthStack";
import SplashScreen from "../screens/SplashScreen";
import useRevenueCat from "../hooks/useRevenueCat";
import Subscription from "../components/subscriptions/Subscription";
import DevModeIndicator from "../components/dev/DevModeIndicator";
import AsyncStorage from "../utils/AsyncStorage";
import { navigationRef, flushPendingNavigation } from "./navigationRef";
import colors from "../assets/Theme/colors";

const TRIAL_KEY = "trialPeriod";

const AppNav = () => {
  const [SplashCompleted, setSplashCompleted] = useState(false);
  const { currentOffering, access, restorePurchases, onPurchaseComplete } =
    useRevenueCat();

  // null = not read from storage yet
  const [trialPeriod, setTrialPeriodState] = useState(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(TRIAL_KEY)
      .then((value) => {
        if (!cancelled) setTrialPeriodState(value === "true");
      })
      .catch(() => {
        if (!cancelled) setTrialPeriodState(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist guest mode so it survives a cold start.
  const setTrialPeriod = (value) => {
    setTrialPeriodState(value);
    AsyncStorage.setItem(TRIAL_KEY, value ? "true" : "false").catch(() => {});
  };

  const gateReady = access !== "loading" && trialPeriod !== null;

  return (
    <NavigationContainer ref={navigationRef} onReady={flushPendingNavigation}>
      {!SplashCompleted ? (
        <SplashScreen setValue={setSplashCompleted} />
      ) : (
        <>
          <DevModeIndicator />
          {!gateReady ? (
            // Never show the paywall while the entitlement is still unknown -
            // that is what used to greet paying members on every launch.
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={colors.Main[500]} />
            </View>
          ) : access === "pro" || trialPeriod ? (
            <AuthStack />
          ) : (
            <Subscription
              currentOffering={currentOffering}
              trialPeriod={trialPeriod}
              setTrialPeriod={setTrialPeriod}
              restorePurchases={restorePurchases}
              onPurchaseComplete={onPurchaseComplete}
            />
          )}
        </>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.Main[700],
  },
});

export default AppNav;
