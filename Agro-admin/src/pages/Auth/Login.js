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
import Image from "../../assets/images/login.jpg"; // Import using relative path
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
    console.log("Submit Pressed");
    setdisabledButton(true);
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    let username = data.get("email");
    let pass = data.get("password");

    if (username.length == 0 || pass.length == 0) {
      setformError(true);
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
      console.log("Login Response: ", data);

      if (data?.resultCode == 0) {
        let userInfo = await getUserInfoFunction(data.response.token);
        console.log("Extracted User :", userInfo);

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
      <Grid container component="main" sx={{ height: "100vh" }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${Image})`,
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <CssBaseline />
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={6}
          square
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              my: 5,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Logo />
            <div>
              <h3>AgroWise</h3>
              <p>Καλώς ήρθατε στην σελίδα του Διαχειριστή</p>
            </div>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Ον. Χρήστη"
                name="email"
                autoComplete="email"
                autoFocus
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
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={disabledButton}
              >
                {disabledButton ? (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Typography style={{ marginBottom: 5 }}>
                      Φορτώνει..
                    </Typography>

                    <RaceBy size={80} lineWeight={5} speed={1.4} color="gray" />
                  </div>
                ) : (
                  "Σύνδεση"
                )}
              </Button>

              {formError && (
                <Grid item xs={12} mb={1}>
                  <Typography color={"red"}>
                    *Συμπληρώστε το ον. χρήστη και τον κωδικό σας!
                  </Typography>
                </Grid>
              )}

              {/* Register */}
              <Grid mt={1}>
                <Grid item>
                  <Link href="#/Register" variant="body2">
                    {"Δημιουργία νέου λογαριασμού"}
                  </Link>
                </Grid>
                <Typography style={{ marginTop: 10 }}>
                  <Link href="#/Policy" variant="body1">
                    {"Όροι χρήσης και Πολιτική Απορρήτου"}
                  </Link>
                </Typography>
              </Grid>

              <Grid item xs={12} style={{ textAlign: "right" }}>
                <p> Έκδοση: {packageJson.version} </p>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>

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
