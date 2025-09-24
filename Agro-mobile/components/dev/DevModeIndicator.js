import React from "react";
import { View, Text, StyleSheet } from "react-native";
import useRevenueCat from "../../hooks/useRevenueCat";
import colors from "../../assets/Theme/colors";

const DevModeIndicator = () => {
  const { isDevelopmentMode } = useRevenueCat();

  // Only show in development mode
  if (!isDevelopmentMode) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🚀 DEV MODE</Text>
      <Text style={styles.subtext}>Payments Bypassed</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    right: 10,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtext: {
    color: "white",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
});

export default DevModeIndicator;
