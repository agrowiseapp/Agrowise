import { createTheme } from "@mui/material/styles";
import colors from "../assets/scss/_themes-vars.module.scss";

const bgColor = "#eef2f2";

const typo = {
  fontFamily: [
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    '"Helvetica Neue"',
    "Arial",
    "sans-serif",
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(","),
  h6: {
    fontWeight: 500,
    fontSize: "0.75rem",
  },
  h5: {
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  h4: {
    fontSize: "1rem",
    fontWeight: 600,
  },
  h3: {
    fontSize: "1.25rem",
    fontWeight: 600,
  },
  h2: {
    fontSize: "1.5rem",
    fontWeight: 700,
  },
  h1: {
    fontSize: "2.125rem",
    fontWeight: 700,
  },
  subtitle1: {
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: "0.75rem",
    fontWeight: 400,
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 400,
  },
  body1: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: "1.334em",
  },
  body2: {
    letterSpacing: "0em",
    fontWeight: 400,
    lineHeight: "1.5em",
  },
  button: {
    textTransform: "capitalize",
  },
  customInput: {
    marginTop: 1,
    marginBottom: 1,
    "& > label": {
      top: 23,
      left: 0,
      '&[data-shrink="false"]': {
        top: 5,
      },
    },
    "& > div > input": {
      padding: "30.5px 14px 11.5px !important",
    },
    "& legend": {
      display: "none",
    },
    "& fieldset": {
      top: 0,
    },
  },
  mainContent: {
    width: "100%",
    minHeight: "calc(100vh - 88px)",
    flexGrow: 1,
    padding: "10px",
    marginTop: "88px",
    marginRight: "10px",
    borderRadius: "10px",
  },
  menuCaption: {
    fontSize: "0.875rem",
    fontWeight: 500,
    padding: "6px",
    textTransform: "capitalize",
    marginTop: "10px",
  },
  subMenuCaption: {
    fontSize: "0.6875rem",
    fontWeight: 500,
    textTransform: "capitalize",
  },
  commonAvatar: {
    cursor: "pointer",
    borderRadius: "8px",
  },
  smallAvatar: {
    width: "22px",
    height: "22px",
    fontSize: "1rem",
  },
  mediumAvatar: {
    width: "34px",
    height: "34px",
    fontSize: "1.2rem",
  },
  largeAvatar: {
    width: "44px",
    height: "44px",
    fontSize: "1.5rem",
  },
};

const overrides = {
  MuiButton: {
    styleOverrides: {
      root: {
        fontWeight: 500,
        fontSize: 16,
        borderRadius: 10,
        padding: 8,
        boxShadow:
          "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
      },
    },
  },
  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        backgroundImage: "none",
        boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)",
      },
      rounded: {
        borderRadius: 7,
      },
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: {
        color: colors.textDark,
        padding: "5px",
      },
      title: {
        fontSize: "1.125rem",
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: "10px 20px",
      },
    },
  },
  MuiCardActions: {
    styleOverrides: {
      root: {
        padding: "10px",
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        color: colors.primaryMain,
        paddingTop: "10px",
        paddingBottom: "10px",
        "&.Mui-selected": {
          color: colors.menuSelected,
          backgroundColor: colors.menuSelectedBack,
          "&:hover": {
            backgroundColor: colors.menuSelectedBack,
          },
          "& .MuiListItemIcon-root": {
            color: colors.menuSelected,
          },
          "& .MuiListItemText-primary": {
            color: colors.menuSelected,
          },
        },
        "&:hover": {
          backgroundColor: colors.menuSelectedBack,
          color: colors.menuSelected,
          "& .MuiListItemIcon-root": {
            color: colors.menuSelected,
          },
          "& .MuiListItemText-primary": {
            color: colors.menuSelected,
          },
        },
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        color: colors.primaryDark,
        minWidth: "36px",
      },
    },
  },
  MuiListItemText: {
    styleOverrides: {
      primary: {
        color: colors.primaryMain,
        fontWeight: 500,
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      input: {
        color: colors.grey900,
        "&::placeholder": {
          color: colors.grey900,
          fontSize: "0.875rem",
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        background: bgColor,
        borderRadius: 10,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: colors.grey200,
        },
        "&:hover $notchedOutline": {
          borderColor: colors.grey900,
        },
        "&.MuiInputBase-multiline": {
          padding: 1,
        },
      },
      input: {
        fontWeight: 400,
        background: bgColor,
        padding: "15.5px 14px",
        borderRadius: 10,
        "&.MuiInputBase-inputSizeSmall": {
          padding: "10px 14px",
          "&.MuiInputBase-inputAdornedStart": {
            paddingLeft: 0,
          },
        },
      },
      inputAdornedStart: {
        paddingLeft: 4,
      },
      notchedOutline: {
        borderRadius: 10,
      },
    },
  },
  MuiAppBar: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        background: "#fff",
        boxShadow: "1px 1px 8px rgba(0, 0, 0, 0.2)",
        color: colors.primaryMain,
      },
    },
  },
};

const theme = createTheme({
  palette: {
    // paper & background
    background: {
      default: "#DAE0E6",
      paper: "#ffffff",
    },
    common: {
      black: colors.darkPaper,
    },
    primary: {
      light: colors.primaryLight,
      main: colors.primaryMain,
      dark: colors.primaryDark,
      200: colors.primary200,
      800: colors.primary800,
    },
    secondary: {
      light: colors.secondaryLight,
      main: colors.secondaryMain,
      dark: colors.secondaryDark,
      200: colors.secondary200,
      800: colors.secondary800,
    },
    error: {
      light: colors.errorLight,
      main: colors.errorMain,
      dark: colors.errorDark,
    },
    orange: {
      light: colors.orangeLight,
      main: colors.orangeMain,
      dark: colors.orangeDark,
    },
    warning: {
      light: colors.warningLight,
      main: colors.warningMain,
      dark: colors.warningDark,
    },
    success: {
      light: colors.successLight,
      200: colors.success200,
      main: colors.successMain,
      dark: colors.successDark,
    },
    grey: {
      50: colors.grey50,
      100: colors.grey100,
      500: colors.darkTextSecondary,
      600: colors.heading,
      700: colors.darkTextPrimary,
      900: colors.textDark,
    },
    dark: {
      light: colors.darkTextPrimary,
      main: colors.darkLevel1,
      dark: colors.darkLevel2,
      800: colors.darkBackground,
      900: colors.darkPaper,
    },
    text: {
      primary: "#333",
      secondary: "#344",
      dark: colors.textDark,
      hint: colors.grey100,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: typo,
  components: overrides,
});

export default theme;
