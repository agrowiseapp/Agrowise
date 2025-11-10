import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthStack } from "./AuthStack";
import SplashScreen from "../screens/SplashScreen";
import useRevenueCat from "../hooks/useRevenueCat";
import Subscription from "../components/subscriptions/Subscription";
import DevModeIndicator from "../components/dev/DevModeIndicator";

const AppNav = () => {
  const [SplashCompleted, setSplashCompleted] = useState(false);
  const { currentOffering, customerInfo, isProMember, isLoading: revenueCatLoading } = useRevenueCat();
  const [trialPeriod, setTrialPeriod] = useState(false);

  console.log("🔍 AppNav - RevenueCat Loading:", revenueCatLoading);
  console.log("🔍 AppNav - isProMember:", isProMember);
  console.log("🔍 AppNav - SplashCompleted:", SplashCompleted);

  return (
    <NavigationContainer>
      {!SplashCompleted || revenueCatLoading ? (
        <SplashScreen setValue={setSplashCompleted} />
      ) : (
        <>
          <DevModeIndicator />
          {isProMember || trialPeriod ? (
            <AuthStack />
          ) : (
            <Subscription
              currentOffering={currentOffering}
              trialPeriod={trialPeriod}
              setTrialPeriod={setTrialPeriod}
            />
          )}
        </>
      )}
    </NavigationContainer>
  );
};

export default AppNav;
