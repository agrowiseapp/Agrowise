import * as React from "react";
import { useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { redux_Navigation, redux_resetNavigation } from "../redux/Navigation";
import { redux_resetUser } from "../redux/User";
import {
  AiFillHome,
  AiFillMessage,
  AiFillEdit,
  AiOutlineClose,
  AiFillSetting,
  AiFillFlag,
} from "react-icons/ai";
import Logo from "../components/logo/Logo";
import ProfileSection from "./ProfileSection";
import useInactivityTimer from "../hooks/useInactivityTimer";
import SessionTimer from "../components/timer/SessionTimer";

const drawerWidth = 280;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function PersistentDrawerLeft({ child }) {
  // 1) Data
  const theme = useTheme();
  const User = useSelector((state) => state.User.value);
  const NavRedux = useSelector((state) => state.Navigation.value);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [open, setOpen] = React.useState(false);

  // Auto-logout after 10 minutes of inactivity
  const handleLogout = () => {
    alert("Η συνεδρία σας έληξε λόγω αδράνειας. Θα μεταφερθείτε στη σελίδα σύνδεσης.");
    dispatch(redux_resetNavigation());
    dispatch(redux_resetUser());
    navigate("/");
  };

  const { remainingTime, formattedTime } = useInactivityTimer(600000, handleLogout); // 10 minutes

  // 3) Functions
  const navigateFunction = (page) => {
    switch (page) {
      case "Κύρια Σελίδα":
        navigate("/Dashboard");

        dispatch(
          redux_Navigation({
            Page: "Κύρια Σελίδα",
          })
        );

        break;
      case "Ενημέρωση":
        navigate("/News");
        dispatch(
          redux_Navigation({
            Page: "Ενημέρωση",
          })
        );

        break;
      case "Επικοινωνία":
        navigate("/Messages");
        dispatch(
          redux_Navigation({
            Page: "Επικοινωνία",
          })
        );

        break;
      case "Ρυθμίσεις":
        navigate("/Settings");
        dispatch(
          redux_Navigation({
            Page: "Ρυθμίσεις",
          })
        );

        break;
      case "Αναφορές":
        navigate("/Reports");
        dispatch(
          redux_Navigation({
            Page: "Αναφορές",
          })
        );

        break;
      default:
        navigate("/");
        break;
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const navigateToMainScreen = () => {
    navigate("/Dashboard");

    dispatch(
      redux_Navigation({
        Page: "Κύρια Σελίδα",
      })
    );
  };


  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="absolute" open={open}>
        <Toolbar
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              style={{
                background: theme.palette.primary.dark,
                padding: 4,
                borderRadius: 5,
              }}
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ml: 2, ...(open && { display: "none" }) }}
            >
              <MenuIcon style={{ color: "#fff" }} />
            </IconButton>
            <Typography
              variant="h3"
              noWrap
              component="div"
              onClick={navigateToMainScreen}
              style={{ cursor: "pointer" }}
            >
              AgroWise
            </Typography>
          </div>

          <ProfileSection />
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            boxShadow: 0,
            width: drawerWidth,
            boxSizing: "border-box",
            background: theme.palette.background.default,
            borderBottomRightRadius: 15,
            border: 0,
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader
          style={{
            background: "#fff",
            //marginLeft: 20,
            //marginRight: 20,
            // borderBottomLeftRadius: 15,
            // borderBottomRightRadius: 15,
            borderRight: theme.palette.primary.main,
            boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h3"
            color={theme.palette.primary.light}
            style={{ marginLeft: 10 }}
          >
            Μενού
          </Typography>
          <IconButton
            style={{
              background: theme.palette.primary.dark,
              padding: 8,
              borderRadius: 5,
            }}
            onClick={handleDrawerClose}
          >
            <AiOutlineClose color={theme.palette.primary.light} size={18} />
          </IconButton>
        </DrawerHeader>

        <List
          style={{
            background: "#fff",
            height: "100%",
            borderRadius: 15,
            margin: 20,
            boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Navigation menu section */}
          <div style={{ flex: 1, overflowY: "auto", paddingTop: 20 }}>

          {[
            "Κύρια Σελίδα",
            "Ενημέρωση",
            "Επικοινωνία",
            "Ρυθμίσεις",
            "Αναφορές",
          ].map((text, index) =>
            index !== 3 ? (
              <ListItem key={text} onClick={() => navigateFunction(text)}>
                <ListItemButton
                  sx={{
                    borderRadius: "10px",
                    padding: "10px",
                    ...(NavRedux.Page === text && {
                      backgroundColor: theme.palette.primary.dark,
                      color: "white !important",
                      "& .MuiListItemIcon-root": {
                        color: "white !important",
                      },
                      "& .MuiListItemText-primary": {
                        color: "white !important",
                      },
                    }),
                  }}
                >
                  <ListItemIcon>
                    {index === 0 && (
                      <AiFillHome
                        size={18}
                      />
                    )}
                    {index === 1 && (
                      <AiFillEdit
                        size={18}
                      />
                    )}
                    {index === 2 && (
                      <AiFillMessage
                        size={18}
                      />
                    )}
                    {index === 4 && (
                      <AiFillFlag
                        size={18}
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                  />
                </ListItemButton>
              </ListItem>
            ) : (
              User?.User?.userLevel == 2 && (
                <ListItem key={text} onClick={() => navigateFunction(text)}>
                  <ListItemButton
                    sx={{
                      borderRadius: "10px",
                      padding: "10px",
                      ...(NavRedux.Page === text && {
                        backgroundColor: theme.palette.primary.dark,
                        color: "white !important",
                        "& .MuiListItemIcon-root": {
                          color: "white !important",
                        },
                        "& .MuiListItemText-primary": {
                          color: "white !important",
                        },
                      }),
                    }}
                  >
                    <ListItemIcon>
                      {index === 3 && (
                        <AiFillSetting
                          size={18}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={text}
                    />
                  </ListItemButton>
                </ListItem>
              )
            )
          )}
          </div>

          {/* Session Timer at the bottom */}
          <div style={{ flexShrink: 0, marginTop: "auto" }}>
            <SessionTimer
              formattedTime={formattedTime}
              remainingTime={remainingTime}
            />
          </div>
        </List>
      </Drawer>
      <Main open={open} style={{ marginTop: 10 }}>
        <DrawerHeader />
        {child}
      </Main>
    </Box>
  );
}
