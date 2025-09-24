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
  CssBaseline,
  Snackbar,
  Typography,
} from "@mui/material";
import { loginUserApi, registerUserApi, UserInfoApi } from "../../api/LoginApi";
import Image from "../../assets/images/login.jpg"; // Import using relative path
import MuiAlert from "@mui/material/Alert";
import { Stack } from "@mui/system";
import avatar1 from "../../assets/images/avatar1.png";
import avatar2 from "../../assets/images/avatar2.png";
import avatar3 from "../../assets/images/avatar3.png";
import avatar4 from "../../assets/images/avatar4.png";

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Register() {
  // 1) Data

  //Api Response Alert
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setalertType] = useState("error");
  const [alertMessage, setalertMessage] = useState("");
  const [formError, setformError] = useState(false);
  const [avatarNumber, setavatarNumber] = useState(1);

  //3 Functions
  const handleSubmit = async (event) => {
    event.preventDefault();
    const dataForm = new FormData(event.currentTarget);

    let username = dataForm.get("email");
    let pass = dataForm.get("password");
    let name = dataForm.get("Όνομα");
    let surname = dataForm.get("Επίθετο");
    let phone = dataForm.get("Τηλέφωνο");

    if (
      username.length == 0 ||
      pass.length == 0 ||
      surname.length == 0 ||
      name.length == 0 ||
      phone.length == 0
    ) {
      setformError(true);
      return;
    }
    setformError(false);

    try {
      let bodyObject = {
        email: username,
        password: pass,
        firstName: name,
        lastName: surname,
        phone: phone,
        isAdmin: true,
        avatar: avatarNumber,
        userLevel: 2,
      };

      // console.log("Body objcet :", bodyObject);

      const response = await registerUserApi("apiUrl", bodyObject);
      const data = await response.json();
      console.log("User Info: ", data);

      if (data.resultCode == 1) {
        setOpenAlert(true);
        setalertType("error");
        setalertMessage("Αποτυχία! " + data.message);
      }

      if (data?.resultCode == 0) {
        setOpenAlert(true);
        setalertType("success");
        setalertMessage("Ο χρήστης δημιουργήθηκε με επιτυχία!");

        // Reset the form fields
        event.target.reset();
      }
    } catch (error) {
      console.log("Error :", error);
      setOpenAlert(true);
      setalertType("error");
      setalertMessage("Κάτι πήγε στραβά! Δοκιμάστε ξανά.");
    }
  };

  const handleAvatarChange = (num) => {
    setavatarNumber(num);
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
            <div>
              <h1>AgroWise</h1>
              <p>Δημιουργία νέου λογαριασμού Διαχειριστή</p>
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
                size="small"
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
                size="small"
                fullWidth
                name="password"
                label="Κωδικός"
                type="password"
                id="password"
              />
              <TextField
                margin="normal"
                required
                size="small"
                fullWidth
                name="Τηλέφωνο"
                label="Τηλέφωνο"
                //type="number"
                id="phone"
                InputProps={{ inputProps: { maxLength: 10 } }}
              />
              <TextField
                margin="normal"
                required
                size="small"
                fullWidth
                name="Όνομα"
                label="Όνομα"
                type="text"
                id="name"
              />
              <TextField
                margin="normal"
                required
                size="small"
                fullWidth
                name="Επίθετο"
                label="Επίθετο"
                type="text"
                id="surname"
              />

              <Grid
                container
                mt={2}
                style={{ display: "flex", flexDirection: "" }}
              >
                <Grid item xs={12} mb={2}>
                  <Typography>Επέλεξε ένα από τα παρακάτω Avatar :</Typography>
                </Grid>
                <Stack direction="row" spacing={4}>
                  <Avatar
                    alt="avatar1"
                    src={avatar1}
                    onClick={() => handleAvatarChange(1)}
                    style={
                      avatarNumber == 1
                        ? { border: "3px solid green", cursor: "pointer" }
                        : { cursor: "pointer" }
                    }
                  />
                  <Avatar
                    alt="avatar2"
                    src={avatar2}
                    onClick={() => handleAvatarChange(2)}
                    style={
                      avatarNumber == 2
                        ? { border: "3px solid green", cursor: "pointer" }
                        : { cursor: "pointer" }
                    }
                  />
                  <Avatar
                    alt="avatar3"
                    src={avatar3}
                    onClick={() => handleAvatarChange(3)}
                    style={
                      avatarNumber == 3
                        ? { border: "3px solid green", cursor: "pointer" }
                        : { cursor: "pointer" }
                    }
                  />
                  <Avatar
                    alt="avatar4"
                    src={avatar4}
                    onClick={() => handleAvatarChange(4)}
                    style={
                      avatarNumber == 4
                        ? { border: "3px solid green", cursor: "pointer" }
                        : { cursor: "pointer" }
                    }
                  />
                </Stack>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Δημιουργία
              </Button>

              {formError && (
                <Grid item xs={12} mb={1}>
                  <Typography color={"red"}>
                    *Όλα τα πεδία είναι απαραίτητα!
                  </Typography>
                </Grid>
              )}

              <Grid container mt={1}>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Επιστροφή στην σελίδα σύνδεσης"}
                  </Link>
                </Grid>
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

export default Register;
