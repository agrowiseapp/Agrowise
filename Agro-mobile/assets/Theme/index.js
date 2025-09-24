import colors from "./colors";
import typography from "./typography";
import spacing from "./spacing";

// Utility functions for responsive and dynamic styling
export const createStyles = {
  // Responsive utilities
  responsive: {
    fontSize: (base, scale = 1.2) => ({
      small: base / scale,
      medium: base,
      large: base * scale,
    }),
    spacing: (base, scale = 1.5) => ({
      small: base / scale,
      medium: base,
      large: base * scale,
    }),
  },

  // Layout utilities
  layout: {
    flex: (flex = 1) => ({ flex }),
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    column: {
      flexDirection: "column",
    },
    spaceBetween: {
      justifyContent: "space-between",
    },
    spaceAround: {
      justifyContent: "space-around",
    },
  },

  // Shadow utilities (disabled)
  shadow: (level = "md") => ({}),

  // Modern component patterns extracted from Login/Subscription screens
  patterns: {
    modernCard: {
      backgroundColor: colors.Surface.primary,
      borderRadius: 16,
      padding: spacing.lg,
    },
    featureCard: {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 8,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.Second[500],
    },
    pricingCard: {
      backgroundColor: colors.Main[500],
      borderRadius: 16,
      padding: 24,
    },
    glassMorphism: {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 12,
      backdropFilter: "blur(10px)",
    },
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  createStyles,

  // Enhanced component styles based on Login/Subscription patterns
  components: {
    // Button variants from Login screen
    button: {
      // Primary CTA (Subscription style)
      primary: {
        backgroundColor: colors.Second[500],
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 16,
      },
      // Google style button
      google: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
      },
      // Secondary outline
      secondary: {
        backgroundColor: colors.Main[700],
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: colors.Main[600],
      },
      // Pricing card button
      pricing: {
        backgroundColor: colors.Main[500],
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 24,
      },
    },

    // Card variants from both screens
    card: {
      // Basic modern card
      default: {
        backgroundColor: colors.Surface.primary,
        borderRadius: spacing.card.borderRadius,
        padding: spacing.card.padding,
        margin: spacing.card.margin,
      },
      // Feature card from Subscription
      feature: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: colors.Second[500],
      },
      // Pricing card
      pricing: {
        backgroundColor: colors.Main[500],
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
      },
      // Loading state card
      loading: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
      },
    },

    // Input variants from Login screen
    input: {
      // Modern clean input
      default: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: "#000",
        marginBottom: 16,
      },
      // Compact input (when form is shown)
      compact: {
        backgroundColor: "#ffffff",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 15,
        color: "#000",
        marginBottom: 12,
      },
    },

    // Icon badge from Subscription
    iconBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.Second[500],
      justifyContent: "center",
      alignItems: "center",
    },

    // Divider from Login
    divider: {
      container: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 16,
      },
      line: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.3)",
      },
      text: {
        marginHorizontal: 16,
        color: "rgba(255,255,255,0.8)",
        fontSize: 16,
        fontWeight: "500",
      },
    },
  },

  // Screen layouts from both reference screens
  layouts: {
    // Subscription screen layout
    subscription: {
      container: {
        flex: 1,
        backgroundColor: colors.Main[700],
      },
      header: {
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 24,
      },
      content: {
        flex: 1,
        paddingHorizontal: 16,
      },
      closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 1,
        padding: 8,
      },
    },
    // Login screen layout
    login: {
      container: {
        flex: 1,
        backgroundColor: colors.Main[500],
      },
      keyboardAvoiding: {
        flex: 1,
      },
      scrollContent: {
        flexGrow: 1,
        paddingVertical: 10,
        justifyContent: "center",
      },
      formContainer: {
        width: "85%",
        alignSelf: "center",
        paddingHorizontal: 15,
      },
    },
  },
};

export default theme;
