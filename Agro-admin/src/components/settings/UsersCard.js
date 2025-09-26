import PropTypes from "prop-types";
import { useEffect, useState, forwardRef } from "react";
import MuiAlert from "@mui/material/Alert";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  Box,
  TextField,
  CardContent,
  Avatar,
  ListItemAvatar,
  List,
  ListItem,
  Typography,
  Button,
  ListItemText,
  Snackbar,
} from "@mui/material";

// project imports
import MainCard from "../ui/cards/MainCard";
import SkeletonPopularCard from "../ui/skeletons/LinksCard";
import settings from "../../../package.json";
import { useSelector } from "react-redux";
import { deleteUserApi, getAllUsersApi } from "../../api/LoginApi";
import GroupIcon from "@mui/icons-material/Group";
import { resetPasswordApi } from "../../api/SettingsApi";
import { getOrCreateChatApi } from "../../api/ChatApi";
import { postNewMessageApi } from "../../api/MessagesApi";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "1px solid gray",
  boxShadow: 24,
  p: 5,
  borderRadius: 2,
};

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function UsersCard() {
  //1) Data
  const [users, setusers] = useState([]);
  const theme = useTheme();
  const User = useSelector((state) => state.User.value);
  const [searchQuery, setSearchQuery] = useState("");
  const [Loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [userForDelete, setuserForDelete] = useState(null);
  const [openModalForReset, setOpenModalForReset] = useState(false);
  const [userForReset, setuserForReset] = useState(null);
  const [password, setpassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");
  const [userForChat, setuserForChat] = useState(null);
  const [openModalForChat, setOpenModalForChat] = useState(false);
  const [message, setmessage] = useState("");
  const [showMessage, setshowMessage] = useState(false);
  const [selectedChat, setselectedChat] = useState(null);
  const [disableMessageInput, setDisableMessageInput] = useState(true);

  //Api Response Alert
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setalertType] = useState("error");
  const [alertMessage, setalertMessage] = useState("");

  // 2) UseEffects

  useEffect(() => {
    getUsersFunction();
  }, []);

  // 3) Functions
  const getUsersFunction = async () => {
    try {
      setLoading(true);
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await getAllUsersApi(url, token);
      const dataResponse = await response.json();

      //console.log("DATA array RESPONSE:", dataResponse);

      if (dataResponse?.resultCode === 0) {
        //console.log("Links:", links);
        setusers(dataResponse.response);
      } else {
      }
      setLoading(false);
    } catch (error) {
      console.log("ERROR :", error);
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteUser = async (user) => {
    setuserForDelete(user);
    setOpenModal(true);
  };

  const deleteIsConfirmed = async () => {
    //call endpoint for deleting user.
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      let newObject = {
        email: userForDelete.email,
        phone: userForDelete.phone,
      };

      const response = await deleteUserApi(url, newObject, token);
      const data = await response.json();

      console.log("DATA :", data);

      if (data?.resultCode === 0) {
        setOpenAlert(true);
        setalertType("success");
        setalertMessage("O Χρήστης διαγράφτηκε με επιτυχία!");
        setOpenModal(false);
        getUsersFunction();
      } else {
        setOpenAlert(true);
        setalertType("error");
        setOpenModal(false);
        setalertMessage("Κάτι πήγε στραβά. Ο χρήστης δεν διαγράφτηκε!");
      }
    } catch (error) {
      console.log("Error :", error);
      setOpenAlert(true);
      setalertType("error");
      setOpenModal(false);
      setalertMessage("Κάτι πήγε στραβά. Ο χρήστης δεν διαγράφτηκε!");
    }
  };

  const resetPassword = async (user) => {
    setuserForReset(user);
    setOpenModalForReset(true);
  };

  const handleSubmitReset = async () => {
    //call endpoint for deleting user.

    if (password !== reEnterPassword) {
      setalertType("error");
      setalertMessage("Οι κωδικοί δεν ταιριάζουν!");
      setOpenAlert(true);
      console.log("Clicked");
      return;
    }

    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      let newObject = {
        email: userForReset.email,
        password: password,
      };

      const response = await resetPasswordApi(url, newObject, token);
      const data = await response.json();

      console.log("DATA :", data);

      if (data?.resultCode === 0) {
        setOpenAlert(true);
        setalertType("success");
        setalertMessage("O κωδικός άλλαξε με επιτυχία!");
        setOpenModalForReset(false);
      } else {
        setOpenAlert(true);
        setalertType("error");
        setOpenModalForReset(false);
        setalertMessage("Κάτι πήγε στραβά. Ο χρήστης δεν διαγράφτηκε!");
      }
    } catch (error) {
      console.log("Error 2:", error);
      setOpenAlert(true);
      setalertType("error");
      setOpenModalForReset(false);
      setalertMessage("Κάτι πήγε στραβά. Ο χρήστης δεν διαγράφτηκε!");
    }
  };

  const startChat = async (user) => {
    setuserForChat(user);
    setOpenModalForChat(true);
  };

  const handleCreateChat = async () => {
    //call endpoint for deleting user.

    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      let newObject = {
        userId: userForChat._id,
      };

      // 1) check if chat exists.

      // 2) open a text field for the first message.

      const response = await getOrCreateChatApi(url, newObject, token);
      const data = await response.json();

      console.log("DATA from create chat :", data);

      if (data?.resultCode !== 1) {
        setselectedChat(data?.response?._id);

        setOpenAlert(true);
        setalertType("success");
        setalertMessage(data?.message);
        setshowMessage(true);
        setmessage("");
        setDisableMessageInput(false);
      } else {
        setOpenAlert(true);
        setalertType("error");
        setOpenModalForChat(false);
        setalertMessage("Κάτι πήγε στραβά. Δοκιμάστε ξανά!");
        setshowMessage(false);
        setmessage("");
      }
    } catch (error) {
      console.log("Error 2:", error);
      setOpenAlert(true);
      setalertType("error");
      setOpenModalForChat(false);
      setalertMessage("Κάτι πήγε στραβά. Δοκιμάστε ξανά!");
      setshowMessage(false);
      setmessage("");
    }
  };

  const sendMessage = async () => {
    if (message == "" || message == null) return;
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;
      let name = User.User.firstName + " " + User.User.lastName;

      let bodyObject = {
        author: name + " - (Διαχειριστής)",
        authorId: User.User.userId,
        text: message,
        chatId: selectedChat,
        userType: User.User.isAdmin,
      };

      const response = await postNewMessageApi(url, bodyObject, token);
      const data = await response.json();

      //console.log("Data response from message : ", data);

      if (data?.resultCode == 0) {
        console.log("Message sent successfully..");

        setOpenAlert(true);
        setalertType("success");
        setalertMessage("Το μήνυμα στάλθηκε.");
        setDisableMessageInput(true);
        setOpenModalForChat(false);
        setmessage("");
      } else {
        setOpenAlert(true);
        setalertType("error");
        setalertMessage("Το μήνυμα δεν στάλθηκε.");
      }
    } catch (error) {
      console.log("Error while trying to send Message :", error);
      setOpenAlert(true);
      setalertType("error");
      setalertMessage("Το μήνυμα δεν στάλθηκε.");
    }
  };

  // 4) Styles

  const styles = {
    container: {
      backgroundColor: "#fff",
      maxWidth: "100%",
      padding: 15,
    },
    tableContainer: {
      overflowX: "auto",
    },
    tableWrapper: {
      width: "100%",
      overflowX: "auto",
      display: "flex",
      justifyContent: "space-between",
    },
  };

  return Loading ? (
    <SkeletonPopularCard />
  ) : (
    <>
      <MainCard content={false}>
        <CardContent>
          <Grid item xs={12}>
            <List sx={{ py: 0, mx: -1 }}>
              <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    sx={{
                      ...theme.typography.commonAvatar,
                      ...theme.typography.largeAvatar,
                      backgroundColor: theme.palette.primary.dark,
                      color: "#fff",
                    }}
                  >
                    <GroupIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  sx={{
                    py: 0,
                  }}
                  primary={
                    <Typography
                      color="#fff"
                      variant="h4"
                    >
                      Χρήστες
                    </Typography>
                  }
                  secondary={
                    <Typography
                      color="gray"
                      variant="p"
                      fontWeight={500}
                      fontSize={12}
                      style={{ cursor: "pointer" }}
                    >
                      Λίστα με όλους τους χρήστες που υπάρχουν.
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Αναζήτηση"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              size="small"
              margin="normal"
            />
            <div style={styles.tableWrapper}>
              <TableContainer style={styles.tableContainer}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Όνομα</TableCell>
                      <TableCell>Επώνυμο</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Τηλέφωνο</TableCell>
                      <TableCell>Είδος</TableCell>
                      <TableCell>Προνόμια</TableCell>
                      <TableCell>Διαγραφή</TableCell>
                      <TableCell>Κωδικός</TableCell>
                      <TableCell>Επικοινωνία</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.firstName}</TableCell>
                        <TableCell>{user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          {user.isAdmin ? "Διαχειριστής" : "Χρήστης"}
                        </TableCell>
                        <TableCell>
                          {user.userLevel == 2
                            ? "Υπερχρήστης"
                            : user.userLevel == 1
                            ? "Απλός"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button onClick={() => deleteUser(user)}>
                            Διαγραφή
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button onClick={() => resetPassword(user)}>
                            Αλλαγή
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button onClick={() => startChat(user)}>Chat</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Grid>
        </CardContent>
      </MainCard>

      {/* Modal For Delete */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* Title */}
          <Typography id="modal-modal-title" variant="h2" component="h2">
            Διαγραφή Χρήστη
          </Typography>
          {/* Content */}
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Είστε σίγουρος/η ότι θέλετε να διαγράψετε αυτόν τον χρήστη ;
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Oν/μο : {userForDelete?.firstName + " " + userForDelete?.lastName}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Τηλέφωνο : {userForDelete?.phone}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Email : {userForDelete?.email}
          </Typography>
          {/* Buttons */}
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <Button fullWidth onClick={() => setOpenModal(false)}>
                Πίσω
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                style={{
                  background: "red",
                  color: "white",
                }}
                onClick={deleteIsConfirmed}
              >
                Διαγραφή
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Modal For Reset */}
      <Modal
        open={openModalForReset}
        onClose={() => setOpenModalForReset(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* Title */}
          <Typography id="modal-modal-title" variant="h2" component="h2">
            Επαναφορά Κωδικού
          </Typography>
          {/* Content */}
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Παρακαλώ πληκτρολογήσε τον νεο κωδικό για τον παρακάτω χρήστη :
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Oν/μο : {userForReset?.firstName + " " + userForReset?.lastName}
          </Typography>

          <Box sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              size="small"
              fullWidth
              name="password"
              label="Κωδικός"
              type="text"
              id="password"
              value={password}
              onChange={(type) => setpassword(type.target.value)}
            />

            <TextField
              margin="normal"
              required
              size="small"
              fullWidth
              name="re-password"
              label="Επαναφορά Κωδικού"
              type="text"
              id="re-password"
              value={reEnterPassword}
              onChange={(type) => setReEnterPassword(type.target.value)}
            />
          </Box>

          {/* Buttons */}
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <Button
                fullWidth
                onClick={() => {
                  setOpenModalForReset(false);
                  setpassword("");
                  setReEnterPassword("");
                }}
              >
                Πίσω
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button fullWidth variant="contained" onClick={handleSubmitReset}>
                Επαναφορά
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Modal For Chat */}
      <Modal
        open={openModalForChat}
        onClose={() => setOpenModalForChat(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* Title */}
          <Typography id="modal-modal-title" variant="h2" component="h2">
            Δημιουργία Chat με χρήστη
          </Typography>
          {/* Content */}
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Πρόκειται να δημιουργήσετε μια συνομιλία με τον παρακάτω χρήστη :
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 1 }}>
            Oν/μο : {userForChat?.firstName + " " + userForChat?.lastName}
          </Typography>

          {showMessage && (
            <Box sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                size="small"
                fullWidth
                name="message"
                label="Μήνυμα"
                type="text"
                id="message"
                value={message}
                onChange={(type) => setmessage(type.target.value)}
              />
            </Box>
          )}

          {/* Buttons */}
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <Button
                fullWidth
                onClick={() => {
                  setOpenModalForChat(false);
                  setshowMessage(false);
                  setmessage("");
                }}
              >
                Πίσω
              </Button>
            </Grid>
            <Grid item xs={6}>
              {showMessage ? (
                <Button fullWidth variant="contained" onClick={sendMessage}>
                  Αποστολή
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCreateChat}
                >
                  Δημιουργία
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </Modal>

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

export default UsersCard;
