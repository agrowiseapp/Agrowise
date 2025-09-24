import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import colors from "../../assets/Theme/colors";

const LoadingComponent = () => {
  return (
    <View className="mt-10">
      <ActivityIndicator size={"large"} color={colors.Main[900]} />
      <Text className="text-lg mt-2">Παρακαλώ Περιμένετε..</Text>
    </View>
  );
};

export default LoadingComponent;
