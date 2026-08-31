import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import AsyncStorage from "../utils/AsyncStorage";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import { useEffect, useState } from "react";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen2 from "../screens/HomeScreen2";
import NewsScreen from "../screens/NewsScreen";
import ChatScreen from "../screens/ChatScreen";
import GroupChatScreen from "../screens/GroupChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import colors from "../assets/Theme/colors";
import { UserInfoApi } from "../apis/LoginApi";
import { clearSession } from "../utils/session";

const Stack = createNativeStackNavigator();
// Created once at module level. Building it inside the component would make a
// brand-new navigator on every render and reset all five tabs.
const Tab = createBottomTabNavigator();

export const AuthStack = () => {
  // null = still deciding, "Login" | "Main" = decided
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = await AsyncStorage.getItem("userToken");

      // No stored session - normal login.
      if (!token) return "Login";

      try {
        const response = await UserInfoApi("apiUrl", token);

        // The server explicitly rejected the token: it is dead, not slow.
        if (response.status === 401 || response.status === 403) {
          await clearSession({ redirect: false });
          return "Login";
        }

        if (response.ok) {
          const data = await response.json();
          if (data?.resultCode === 0 && data?.response) {
            // Refresh the cached profile while we are here.
            await AsyncStorage.setItem(
              "userInfo",
              JSON.stringify(data.response)
            ).catch(() => {});
            if (data.response.chatId !== undefined) {
              await AsyncStorage.setItem(
                "chatId",
                data.response.chatId
              ).catch(() => {});
            }
            return "Main";
          }
          // Reachable server, but it will not accept this token.
          await clearSession({ redirect: false });
          return "Login";
        }

        // 5xx or anything else server-side: not the user's fault, and not
        // proof the token is bad. Let them in on cached data.
        return "Main";
      } catch (error) {
        // Offline / DNS / timeout. Do NOT log the user out for a bad network.
        return "Main";
      }
    };

    restoreSession()
      .then((route) => {
        if (!cancelled) setInitialRoute(route);
      })
      .catch(() => {
        if (!cancelled) setInitialRoute("Login");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (initialRoute === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.Main[500]} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={AppStack} />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          presentation:
            Platform.OS == "android" ? "containedTransparentModal" : "modal",
        }}
      />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let size = 24;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Chat") {
            iconName = focused
              ? "chatbubble-ellipses"
              : "chatbubble-ellipses-outline";
          } else if (route.name === "GroupChat") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "News") {
            iconName = focused ? "newspaper" : "newspaper-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return (
            <View>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },

        tabBarActiveTintColor: colors.Main[600],
        tabBarInactiveTintColor: colors.Second[300],
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {},
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen2} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="GroupChat" component={GroupChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
});
