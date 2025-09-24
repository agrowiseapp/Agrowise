import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";
import AsyncStorage from "../utils/AsyncStorage";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import OnboardScreen from "../screens/OnboardScreen";
import { useEffect, useState } from "react";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import {
  createAnimatableComponent,
  View as AnimatableView,
} from "react-native-animatable";
import HomeScreen2 from "../screens/HomeScreen2";
import NewsScreen from "../screens/NewsScreen";
import ChatScreen from "../screens/ChatScreen";
import GroupChatScreen from "../screens/GroupChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import colors from "../assets/Theme/colors";

const Stack = createNativeStackNavigator();
const AnimatedView = createAnimatableComponent(AnimatableView);
const Tab = createBottomTabNavigator();

export const AuthStack = () => {
  // 1) Data
  const [isFirstLaunch, setisFirstLaunch] = useState(false);

  // 2) Use Effects
  useEffect(() => {
    isFirstLaunchFucntion();

    return;
  }, []);

  // 3) Functions
  const isFirstLaunchFucntion = () => {
    AsyncStorage.getItem("alreadyLaunched").then((value) => {
      if (value !== null) {
        AsyncStorage.setItem("alreadyLaunched", true);
        setisFirstLaunch(true); // Fixed: was setIsLoading(true)
      } else {
        setisFirstLaunch(false);
      }
    });
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Onboarding screen removed from showing - commented out below */}
      {/* {!isFirstLaunch && (
        <Stack.Screen name="Onboard" component={OnboardScreen} />
      )} */}

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
  const Tab = createBottomTabNavigator();

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
        tabBarStyle: {
          //height: 100,
          // backgroundColor: colors.Main[100],
        },
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
