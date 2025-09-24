import { View, Text, TouchableOpacity, Image } from "react-native";
import colors from "../../assets/Theme/colors";
import AsyncStorage from "../../utils/AsyncStorage";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import {
  getChatNotificationApi,
  getCommentsNotificationApi,
} from "../../apis/NotificationsApi";
import Avatar1 from "../../assets/images/avatar1.png";
import Avatar2 from "../../assets/images/avatar2.png";
import Avatar3 from "../../assets/images/avatar3.png";
import Avatar4 from "../../assets/images/avatar4.png";
import Avatar5 from "../../assets/images/avatar5.png";
import Avatar6 from "../../assets/images/avatar6.png";
import Avatar7 from "../../assets/images/avatar7.png";
import Avatar8 from "../../assets/images/avatar8.png";
import { Avatar } from "@rneui/themed";

const avatars = {
  1: Avatar1,
  2: Avatar2,
  3: Avatar3,
  4: Avatar4,
  5: Avatar5,
  6: Avatar6,
  7: Avatar7,
  8: Avatar8,
};

const UserIcon = ({ user, isProMember }) => {
  const navigation = useNavigation();
  const [commentsNotifications, setCommentsNotifications] = useState(0);
  const [chatNotifications, setChatNotifications] = useState(0);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getCommentsNotificationsFunction();
      getChatNotificationsFunction();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    getCommentsNotificationsFunction();
    getChatNotificationsFunction();
  }, []);

  const getCommentsNotificationsFunction = async () => {
    try {
      let userToken = await AsyncStorage.getItem("userToken");

      const response = await getCommentsNotificationApi("url", userToken);
      const data = await response.json();

      if (data?.resultCode === 0) {
        let comments_notification = data?.response?.unreadCountSum;
        let int = parseInt(comments_notification);
        setCommentsNotifications(int);
        AsyncStorage.setItem("commentsNotifications", int.toString());
      }
    } catch (error) {
      console.log("Error on Notifications :", error);
    }
  };

  const getChatNotificationsFunction = async () => {
    try {
      let userToken = await AsyncStorage.getItem("userToken");

      const response = await getChatNotificationApi("url", userToken);
      const data = await response.json();

      if (data?.resultCode === 0) {
        let chat_notification = data?.response;
        let int = parseInt(chat_notification);
        setChatNotifications(int);
        AsyncStorage.setItem("chatNotifications", int.toString());
      }
    } catch (error) {
      console.log("Error on Notifications :", error);
    }
  };

  const getAvatarSource = (avatarId, profilePicture) => {
    // If user has Google profile picture, use it
    if (profilePicture) {
      return { uri: profilePicture };
    }
    // Otherwise, fall back to numbered avatar
    return avatars[avatarId] || avatars[1];
  };

  return (
    <View className="flex justify-end self-end px-5 mt-3 flex-row items-center">
      <View className="flex items-end mr-2">
        <Text className="text-base text-white">Γεια σου,</Text>
        <Text className="text-white">
          {!isProMember ? "Επισκέπτη" : user != null ? user.firstName : ""}
        </Text>
      </View>

      <Animatable.View animation="pulse" duration={2000}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Profile");
          }}
          className="rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: colors.Second[100] }}
        >
          <Image
            source={getAvatarSource(user?.avatar, user?.profilePicture)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#fff",
            }}
          />
        </TouchableOpacity>

        {commentsNotifications + chatNotifications > 0 && (
          <View className="absolute -top-4 -right-3 bg-red-500 rounded-full h-7 w-7 flex-row justify-center items-center border border-red-700">
            <Text className="text-white font-semibold">
              {commentsNotifications + chatNotifications}
            </Text>
          </View>
        )}
      </Animatable.View>
    </View>
  );
};

export default UserIcon;
