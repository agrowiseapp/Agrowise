import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import React from "react";
import colors from "../../assets/Theme/colors";

const LoadingComponent = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={"large"} color={colors.Main[900]} />
      <Text style={styles.text}>Παρακαλώ Περιμένετε..</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
  },
  text: {
    fontSize: 18,
    marginTop: 8,
  },
});

export default LoadingComponent;
