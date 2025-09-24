import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text, Animated } from "react-native";
import colors from "../assets/Theme/colors";

function SplashScreen({ setValue }) {
  // Animation values
  const titleScale = useRef(new Animated.Value(0.5)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start title animation immediately
    Animated.spring(titleScale, {
      toValue: 1,
      tension: 100,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Start tagline fade-in before title finishes (after 400ms of title's ~700ms)
    setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 400);

    // Start loading dots before tagline finishes (after 800ms total)
    setTimeout(() => {
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 800);

    // Set timer to finish splash (total ~3s)
    const timer = setTimeout(() => {
      setValue(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background gradient effect - Static */}
      <View style={styles.backgroundCircle} />

      {/* Main content - Centered text */}
      <View style={styles.content}>
        {/* App Title with scale bounce */}
        <Animated.Text
          style={[
            styles.appName,
            {
              transform: [{ scale: titleScale }]
            }
          ]}
        >
          AgroWise
        </Animated.Text>

        {/* Tagline with fade-in */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity
            }
          ]}
        >
          Latest news, Expert consulting
        </Animated.Text>
      </View>

      {/* Loading indicator */}
      <Animated.View
        style={[
          styles.loadingContainer,
          { opacity: loadingOpacity }
        ]}
      >
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Main[600],
    alignItems: "center",
    justifyContent: "center",
  },
  backgroundCircle: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.Main[500],
    opacity: 0.2,
    top: "30%",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  appName: {
    fontSize: 48,
    textAlign: "center",
    color: "white",
    fontWeight: "600",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontWeight: "300",
  },
  loadingContainer: {
    position: "absolute",
    bottom: 100,
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
    marginHorizontal: 4,
  },
  dot1: {
    backgroundColor: colors.Second[400],
  },
  dot2: {
    backgroundColor: colors.Second[500],
  },
  dot3: {
    backgroundColor: colors.Second[600],
  },
});

export default SplashScreen;