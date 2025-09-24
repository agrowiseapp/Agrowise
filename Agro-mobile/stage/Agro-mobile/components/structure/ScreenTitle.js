import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

const ScreenTitle = ({ title, back, navigation }) => {
  return (
    <View className="flex-row items-center flex-1 mt-5">
      {back && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          className=" p-2"
        >
          <Ionicons name="chevron-back" size={36} color="black" />
        </TouchableOpacity>
      )}
      <Text className="text-3xl font-semibold ml-2">{title}</Text>
    </View>
  );
};

export default ScreenTitle;
