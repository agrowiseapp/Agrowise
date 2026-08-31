import { Alert, Platform, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/AuthContext";
import AppNav from "./navigation/AppNav";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRef, useEffect } from "react";
import AsyncStorage from "./utils/AsyncStorage";
import GoogleSignInService from "./services/GoogleSignInService";
import FirebaseAuthService from "./services/FirebaseAuthService";
import ErrorBoundary from "./components/structure/ErrorBoundary";
import { navigateToTab } from "./navigation/navigationRef";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // expo-notifications 0.32 replaced shouldShowAlert with these two.
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Decide which tab a notification should open.
 * The backend must send a `type` in the notification data payload; anything
 * unrecognised falls back to Home rather than doing nothing.
 */
function targetTabForNotification(data) {
  const type = String(data?.type ?? data?.screen ?? "").toLowerCase();

  if (type.includes("groupchat") || type.includes("group_chat")) {
    return "GroupChat";
  }
  if (type.includes("chat") || type.includes("message")) return "Chat";
  if (type.includes("comment") || type.includes("post") || type.includes("news")) {
    return "News";
  }
  return "Home";
}

async function handleNotificationResponse(response) {
  const data = response?.notification?.request?.content?.data ?? {};

  // Only jump into the signed-in tabs if there is actually a session;
  // otherwise let the normal login flow run.
  const token = await AsyncStorage.getItem("userToken").catch(() => null);
  if (!token) return;

  navigateToTab(targetTabForNotification(data), data);
}

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Configure Google Sign-In services
    GoogleSignInService.configure();
    FirebaseAuthService.configure();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().catch(() => {
      // Push registration failing must never take the app down.
    });

    // The app was launched by tapping a notification while it was killed.
    // The response listener below cannot see that event, so read it directly.
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) handleNotificationResponse(response);
      })
      .catch(() => {});

    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        // Foreground arrival: the handler above already displays it.
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        // Permission was refused - drop any stale token so the backend is not
        // left holding one that can never deliver.
        await AsyncStorage.setItem("deviceToken", "").catch(() => {});
        Alert.alert(
          "Οι Ειδοποιήσεις είναι απενεργοποιημένες.",
          "Δυστυχώς, δεν θα μπορείτε να λάβετε ειδοποιήσεις μέσω εφαρμογής! Συνέχεια στην εφαρμογή."
        );
        return;
      }

      token = (await Notifications.getDevicePushTokenAsync()).data;
      await AsyncStorage.setItem("deviceToken", token ?? "").catch(() => {});
    }

    return token;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle={"dark-content"} />
        <AuthProvider>
          <AppNav />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
