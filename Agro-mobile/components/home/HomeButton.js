import { View, Text, TouchableOpacity, Image } from "react-native";
import SimpleIcons from "../icons/SimpleIcons";
import React, { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";

const HomeButton = ({ title, subtitle, index, duration }) => {
  //1) Data
  const animatedViewRef = useRef(null);
  const navigation = useNavigation();
  //3) Functions
  const navigateFunction = () => {
    if (index === 0) {
      navigation.navigate("News");
    } else {
      navigation.navigate("Chat");
    }
  };

  useEffect(() => {
    animateOnFocus();
    const unsubscribe = navigation.addListener("focus", animateOnFocus);

    return unsubscribe;
  }, [navigation]);

  const animateOnFocus = () => {
    if (animatedViewRef.current) {
      animatedViewRef.current.animate("slideInDown", duration);
    }
  };

  return (
    <Animatable.View ref={animatedViewRef}>
      <TouchableOpacity
        onPress={navigateFunction}
        className=" py-5 mt-5 px-3 relative overflow-hidden  border border-gray-300 shadow-sm flex-row items-center"
        style={{
          backgroundColor: "#fff",
          borderTopEndRadius: 10,
          borderBottomEndRadius: 10,
          borderTopStartRadius: 10,
          borderBottomStartRadius: 10,
        }}
      >
        {/* Bubbles */}
        <View className="w-14 h-14 border border-orange-300 bg-Extras-300 -bottom-7 absolute -right-5 -z-10 rounded-2xl"></View>
        <View className="w-24 h-24 border border-orange-200 bg-Extras-200 -bottom-10 absolute -right-5 -z-20 rounded-3xl"></View>
        <View className="w-36 h-36 border border-orange-100 bg-Extras-100 -bottom-12 absolute -right-5 -z-30 rounded-3xl"></View>
        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-center">
            <View>
              <Text
                className="text-xl font-semibold"
                style={{ color: "#55796c" }}
              >
                {title}
              </Text>
            </View>

            <SimpleIcons name="arrow-forward" size={32} color="#55796c" />
          </View>

          <View className="mt-2">
            <View className="">
              <Text className="text-base" style={{ color: "#55796c" }}>
                {subtitle}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default HomeButton;
