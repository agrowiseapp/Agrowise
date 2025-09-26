import React, { useState, forwardRef } from "react";
import {
  Avatar,
  Button,
  TextField,
  Box,
  Checkbox,
  Grid,
  Link,
  Paper,
  FormControlLabel,
  Typography,
  CssBaseline,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { redux_Navigation } from "../../redux/Navigation";
import { redux_User } from "../../redux/User";
import { loginUserApi, UserInfoApi } from "../../api/LoginApi";
import MuiAlert from "@mui/material/Alert";
import settings from "../../../package.json";
import { styled, useTheme } from "@mui/material/styles";
import Logo from "../../components/logo/Logo";
import { RaceBy } from "@uiball/loaders";
import packageJson from "../../../package.json"; // Adjust the path to package.json

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Login() {
  // 1) Data
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  //Api Response Alert
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setalertType] = useState("error");
  const [alertMessage, setalertMessage] = useState("");
  const [formError, setformError] = useState(false);
  const [disabledButton, setdisabledButton] = useState(false);

  //3 Functions
  const handleSubmit = async (event) => {
    setdisabledButton(true);
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    let username = data.get("email");
    let pass = data.get("password");

    if (username.length == 0 || pass.length == 0) {
      setformError(true);
      setdisabledButton(false);
      return;
    }
    setformError(false);

    try {
      let bodyObject = {
        email: username,
        password: pass,
        isAdmin: true,
      };

      const response = await loginUserApi("apiUrl", bodyObject);
      const data = await response.json();

      if (data?.resultCode == 0) {
        let userInfo = await getUserInfoFunction(data.response.token);

        if (userInfo.isAdmin) {
          setOpenAlert(true);
          setalertType("success");
          setalertMessage("Επιτυχής Σύνδεση!");

          dispatch(
            redux_Navigation({
              Page: "Κύρια Σελίδα",
            })
          );

          dispatch(
            redux_User({
              User: userInfo,
              Token: data.response.token,
            })
          );

          navigate("./Dashboard");
        } else {
          setOpenAlert(true);
          setalertType("error");
          setalertMessage(
            "Αποτυχία Σύνδεσης! Δεν βρέθηκε χρήστης με αυτά τα στοιχεία."
          );
        }
      } else {
        setOpenAlert(true);
        setalertType("error");
        setalertMessage(
          "Αποτυχία Σύνδεσης! Δεν βρέθηκε χρήστης με αυτά τα στοιχεία."
        );
      }
      setdisabledButton(false);
    } catch (error) {
      console.log("Error :", error);
      setOpenAlert(true);
      setalertType("error");
      setalertMessage("Κάτι πήγε στραβά! Δοκιμάστε ξανά.");
      setdisabledButton(false);
    }
  };

  const getUserInfoFunction = async (extracted_token) => {
    try {
      let url = settings["appSettings :"].baseUrl;

      const response = await UserInfoApi(url, extracted_token);
      const data = await response.json();

      //console.log("UserInfo :", data);

      let user = await data?.response;
      let result = await data?.resultCode;

      if (result == 0) {
        return user;
      } else {
        return null;
      }
    } catch (error) {
      console.log("ERROR :", error);
      return null;
    }
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        <Grid
          container
          component="main"
          sx={{ height: "100%", width: "100%", margin: 0, padding: 0 }}
        >
          {/* Left side - Login Form */}
          <Grid
            item
            xs={12}
            md={4.8}
            component={Paper}
            elevation={0}
            square
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              backgroundColor: "#fff",
              padding: 4,
              minHeight: "100vh",
              maxHeight: "100vh",
              overflow: "auto",
              flex: { xs: 1, md: "0 0 40%" },
            }}
          >
            <Box
              sx={{
                mx: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Logo />
              <Typography variant="h4" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                Σύνδεση
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 4, color: "text.secondary", textAlign: "center" }}
              >
                Παρακαλώ εισάγετε τα στοιχεία σας για να συνδεθείτε
              </Typography>
              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ width: "100%", maxWidth: 400 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  sx={{ mb: 0 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Κωδικός"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  sx={{ mb: 2 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 2,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                  disabled={disabledButton}
                >
                  {disabledButton ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography>Φορτώνει..</Typography>
                      <RaceBy
                        size={20}
                        lineWeight={5}
                        speed={1.4}
                        color="white"
                      />
                    </Box>
                  ) : (
                    "Σύνδεση"
                  )}
                </Button>

                {formError && (
                  <Typography
                    color="error"
                    variant="body2"
                    sx={{ mt: 1, textAlign: "center" }}
                  >
                    *Συμπληρώστε το ον. χρήστη και τον κωδικό σας!
                  </Typography>
                )}

                <Typography
                  variant="body2"
                  sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}
                >
                  Δεν έχετε λογαριασμό?{" "}
                  <Link
                    href="#/Register"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    Δημιουργία νέου λογαριασμού
                  </Link>
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}
                >
                  <Link
                    href="#/Policy"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    Όροι χρήσης και Πολιτική Απορρήτου
                  </Link>
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    mt: 2,
                    textAlign: "center",
                    display: "block",
                    color: "text.secondary",
                  }}
                >
                  Έκδοση: {packageJson.version}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right side - Green Background with Content */}
          <Grid
            item
            xs={false}
            md={7.2}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              color: "white",
              padding: 6,
              minHeight: "100vh",
              maxHeight: "100vh",
              overflow: "hidden",
              flex: { md: "0 0 60%" },
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                maxWidth: 600,
                zIndex: 2,
              }}
            >
              <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
                AgroWise
              </Typography>
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 500 }}>
                Καλώς ήρθες στην Σελίδα Διαχείρησης της εφαρμογής
              </Typography>

              <Typography
                variant="body1"
                sx={{ opacity: 0.8, fontStyle: "italic" }}
              >
                Όλα ξεκινάνε από εδώ.
              </Typography>

              {/* Decorative elements */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 4,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.8)",
                  }}
                />
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.4)",
                  }}
                />
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.2)",
                  }}
                />
              </Box>
            </Box>

            {/* Background decorative circles */}
            <Box
              sx={{
                position: "absolute",
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                zIndex: 1,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -100,
                left: -100,
                width: 300,
                height: 300,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                zIndex: 1,
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Api Response Alert */}
      <Snackbar
        open={openAlert}
        autoHideDuration={6000}
        onClose={() => setOpenAlert(false)}
      >
        <Alert
          onClose={() => setOpenAlert(false)}
          severity={alertType}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Login;
