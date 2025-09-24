import colors from "./colors";

export const shadows = {
  // iOS shadows
  ios: {
    sm: {
      shadowColor: colors.Shadow.sm,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
    },
    md: {
      shadowColor: colors.Shadow.md,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
    },
    lg: {
      shadowColor: colors.Shadow.lg,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
    },
    xl: {
      shadowColor: colors.Shadow.xl,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 16,
    },
  },

  // Android shadows (elevation)
  android: {
    sm: { elevation: 2 },
    md: { elevation: 4 },
    lg: { elevation: 8 },
    xl: { elevation: 16 },
  },

  // Cross-platform shadow helper
  getShadow: (size = "md", platform = "ios") => {
    if (platform === "android") {
      return shadows.android[size];
    }
    return shadows.ios[size];
  },
};
