import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import React from "react";
import colors from "../../assets/Theme/colors";

const Loading = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={"large"} color={colors.Main[900]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
  },
});

export default Loading;
