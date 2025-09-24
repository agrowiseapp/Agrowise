import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import colors from "../assets/Theme/colors";

function SplashScreen({ setValue }) {
  //1) Data

  //2) Useeffect

  useEffect(() => {
    const timer = setTimeout(() => {
      // Your code to be executed after 3 seconds
      setValue(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.animationContainer}>
      <Image
        source={require("../assets/Animations/Splash.gif")}
        style={styles.splashImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: colors.Main[600],
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    },
  splashImage: {
    width: 320,
    height: 320,
  },
});

export default SplashScreen;
