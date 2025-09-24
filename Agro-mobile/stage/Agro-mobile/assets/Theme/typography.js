import { Platform } from "react-native";

export const typography = {
  // Font Families
  fontFamily: {
    regular: Platform.OS === "ios" ? "System" : "Roboto",
    medium: Platform.OS === "ios" ? "System" : "Roboto-Medium",
    bold: Platform.OS === "ios" ? "System" : "Roboto-Bold",
    light: Platform.OS === "ios" ? "System" : "Roboto-Light",
  },

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
  },

  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font Weights
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  // Text Styles
  textStyles: {
    // Display styles
    displayLarge: {
      fontSize: 48,
      fontWeight: "700",
      lineHeight: 1.2,
    },
    displayMedium: {
      fontSize: 36,
      fontWeight: "700",
      lineHeight: 1.2,
    },
    displaySmall: {
      fontSize: 30,
      fontWeight: "600",
      lineHeight: 1.3,
    },

    // Heading styles
    h1: {
      fontSize: 24,
      fontWeight: "600",
      lineHeight: 1.3,
    },
    h2: {
      fontSize: 20,
      fontWeight: "600",
      lineHeight: 1.4,
    },
    h3: {
      fontSize: 18,
      fontWeight: "500",
      lineHeight: 1.4,
    },
    h4: {
      fontSize: 16,
      fontWeight: "500",
      lineHeight: 1.5,
    },

    // Body styles
    bodyLarge: {
      fontSize: 18,
      fontWeight: "400",
      lineHeight: 1.6,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 1.6,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: "400",
      lineHeight: 1.5,
    },

    // Label styles
    labelLarge: {
      fontSize: 16,
      fontWeight: "500",
      lineHeight: 1.4,
    },
    labelMedium: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 1.4,
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: "500",
      lineHeight: 1.3,
    },

    // Caption styles
    caption: {
      fontSize: 12,
      fontWeight: "400",
      lineHeight: 1.3,
    },
  },
};
