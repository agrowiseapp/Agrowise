import { Alert, Platform, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/AuthContext";
import AppNav from "./navigation/AppNav";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRef, useState, useEffect } from "react";
import AsyncStorage from "./utils/AsyncStorage";
import GoogleSignInService from "./services/GoogleSignInService";
import FirebaseAuthService from "./services/FirebaseAuthService";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Configure Google Sign-In services
    GoogleSignInService.configure();
    FirebaseAuthService.configure();
  }, []);

  //console.log("customerInfo : ", customerInfo);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

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
        Alert.alert(
          "Οι Ειδοποιήσεις είναι απενεργοποιημένες.",
          "Δυστυχώς, δεν θα μπορείτε να λάβετε ειδοποιήσεις μέσω εφαρμογής! Συνέχεια στην εφαρμογή."
        );
        return;
      }
      //token = (await Notifications.getExpoPushTokenAsync()).data;
      token = (await Notifications.getDevicePushTokenAsync()).data;

      if (token !== undefined) {
        //console.log("Token :", token);
        AsyncStorage.setItem("deviceToken", token);
      } else {
        AsyncStorage.setItem("deviceToken", "");
      }

      //console.log("Device Token :", token);
    } else {
      //Alert.alert("Must use physical device for Push Notifications");
      //console.log("Must use physical device for Push Notifications");
    }

    return token;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={"dark-content"} />
      <AuthProvider>
        <AppNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
