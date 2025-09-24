import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import colors from "../../assets/Theme/colors";

const Loading = () => {
  return (
    <View className="mt-10">
      <ActivityIndicator size={"large"} color={colors.Main[900]} />
    </View>
  );
};

export default Loading;
