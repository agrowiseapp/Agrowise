import { Platform } from "react-native";
import colors from "./colors";

// iOS shadows
const iosShadows = {
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
};

// Android shadows (elevation)
const androidShadows = {
  sm: { elevation: 2 },
  md: { elevation: 4 },
  lg: { elevation: 8 },
  xl: { elevation: 16 },
};

// Cross-platform shadow helper
export const getShadow = (size = "md") => {
  if (Platform.OS === "android") {
    return androidShadows[size] || androidShadows.md;
  }
  return iosShadows[size] || iosShadows.md;
};

export const shadows = {
  ios: iosShadows,
  android: androidShadows,
  getShadow,
};
