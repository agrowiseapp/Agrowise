import colors from "./colors";
import typography from "./typography";
import spacing from "./spacing";
import shadows from "./shadows";

export const theme = {
  colors,
  typography,
  spacing,
  shadows,

  // Common component styles
  components: {
    card: {
      backgroundColor: colors.Surface.primary,
      borderRadius: spacing.card.borderRadius,
      padding: spacing.card.padding,
      margin: spacing.card.margin,
      ...shadows.getShadow("sm"),
    },

    button: {
      primary: {
        backgroundColor: colors.Main[600],
        borderRadius: spacing.button.borderRadius,
        paddingHorizontal: spacing.button.paddingHorizontal,
        paddingVertical: spacing.button.paddingVertical,
      },
      secondary: {
        backgroundColor: colors.Surface.secondary,
        borderColor: colors.Border.medium,
        borderWidth: 1,
        borderRadius: spacing.button.borderRadius,
        paddingHorizontal: spacing.button.paddingHorizontal,
        paddingVertical: spacing.button.paddingVertical,
      },
    },

    input: {
      backgroundColor: colors.Surface.primary,
      borderColor: colors.Border.light,
      borderWidth: 1,
      borderRadius: spacing.input.borderRadius,
      paddingHorizontal: spacing.input.paddingHorizontal,
      paddingVertical: spacing.input.paddingVertical,
    },
  },
};

export default theme;
