import PropTypes from "prop-types";
import { useState, useEffect, useRef, useCallback } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Grid,
  Typography,
  Avatar,
  InputAdornment,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
  Modal,
  Button,
} from "@mui/material";
import { AiFillEdit } from "react-icons/ai";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import SendIcon from "@mui/icons-material/Send";
import settings from "../../../../../package.json";
import SingleMessage from "../../../Messages/SingleMessage";

// project imports
import SkeletonTotalGrowthBarChart from "../../skeletons/QuickPost";
import MainCard from "../MainCard";
import { useSelector } from "react-redux";
import { getSelectedChatApi, readChatApi } from "../../../../api/ChatApi";
import { postNewMessageApi } from "../../../../api/MessagesApi";
import chatImage from "../../../../assets/images/chat.png";
import MarkChatReadIcon from "@mui/icons-material/MarkChatRead";
import { Box } from "@mui/system";

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

// ==============================|| DASHBOARD DEFAULT - TOTAL GROWTH BAR CHART ||============================== //

const ChatCard = ({
  chat,
  updateLeftSelectedChat,
  updateLeftSelectedChatStatus,
}) => {
  // 1) Data
  const theme = useTheme();
  const containerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const User = useSelector((state) => state.User.value);
  const [messageList, setmessageList] = useState([]);
  const [newMessage, setnewMessage] = useState("");
  const [messageLoading, setmessageLoading] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [firstLoad, setfirstLoad] = useState(true);
  const [localRead, setlocalRead] = useState(false);

  // 2 ) useEffect
  useEffect(() => {
    setfirstLoad(false);

    return;
  }, []);

  useEffect(() => {
    console.log("SELECTED CHAT :", chat);
    setlocalRead(false);

    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [chat]);

  useEffect(() => {
    getSelectedChatFunction();

    return;
  }, [chat]);

  const getSelectedChatFunction = async () => {
    setisLoading(true);
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await getSelectedChatApi(url, chat._id, token);
      const data = await response.json();

      console.log("DATA :", data.response);

      if (data?.resultCode === 0) {
        // setselectedPost(data.data);
        setmessageList(data.response.messages);
        //  calculateTotalComments(data?.data?.comments.length, data.data.comments);
        //setLoading(false);
      } else {
      }
      setisLoading(false);
    } catch (error) {
      console.log("ERROR :", error);
    }
  };

  const pollSelectedChat = useCallback(() => {
    if (chat !== null && chat !== undefined) {
      getSelectedChatFunction();
    }
  }, [chat, getSelectedChatFunction]);

  useEffect(() => {
    let time = settings["appSettings :"].notificationsTime;
    const interval = setInterval(pollSelectedChat, time * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [pollSelectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  // 3) Functions

  const sendMessageFunction = async () => {
    if (newMessage == "" || newMessage == null) return;
    try {
      setmessageLoading(true);
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;
      let name = User.User.firstName + " " + User.User.lastName;

      let bodyObject = {
        author: name + " - (Διαχειριστής)",
        authorId: User.User.userId,
        text: newMessage,
        chatId: chat._id,
        userType: User.User.isAdmin,
      };

      const response = await postNewMessageApi(url, bodyObject, token);
      const data = await response.json();

      //console.log("Data response from message : ", data);

      if (data?.resultCode == 0) {
        console.log("Message sent successfully..");

        const newMessageObject = {
          _id: data.response.id,
          createdAt: data.response.publishedAt, // Use the current timestamp or the timestamp received from the server
          text: newMessage,
          user: {
            _id: 1,
            name: name + " - (Διαχειριστής)",
          },
        };

        // Update the messageList state by adding the new message
        setmessageList((prevList) => [newMessageObject, ...prevList]);

        let updateObject = {
          id: chat._id,
          text: newMessage,
          time: data.response.publishedAt,
        };

        updateLeftSelectedChat(updateObject);

        setnewMessage("");
      }
      setmessageLoading(false);
    } catch (error) {
      console.log("Error posting comment :", error);
      //setLoadingSendMessage(false);
      // await setloading(false);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const handleMarkAsRead = async () => {
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      let bodyObject = {
        chatId: chat._id,
        adminRead: true,
      };

      const response = await readChatApi(url, bodyObject, token);
      const data = await response.json();

      console.log("Data response from read chat : ", data);

      if (data?.resultCode == 0) {
        setOpenModal(false);
        setlocalRead(true);
        updateLeftSelectedChatStatus(chat._id);
      }
    } catch (error) {
      console.log("Error on read chat :", error);
      //setLoadingSendMessage(false);
      // await setloading(false);
    }
  };

  const styles = {
    container: {
      backgroundColor: "#fff",
      height: "80vh",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      display: "flex",
      alignItems: "center",
      padding: "16px",
      borderBottom: "1px solid #ccc",
      justifyContent: "space-between",
    },
    avatar: {
      marginRight: "16px",
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.primary.light,
    },
    headerText: {
      color: theme.palette.primary.main,
    },
    subHeaderText: {
      color: theme.palette.text.secondary,
    },
    chatContainer: {
      flex: 1,
      overflowY: "auto",
      padding: "16px",
      flexDirection: "column-reverse",
    },
    sentMessage: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: "16px",
    },
    receivedMessage: {
      display: "flex",
      justifyContent: "flex-start",
      marginBottom: "16px",
    },
    message: {
      backgroundColor: "#0084ff",
      color: "#fff",
      borderRadius: "12px",
      padding: "8px 12px",
      maxWidth: "80%",
      wordBreak: "break-word",
    },
    messageText: {
      fontSize: "14px",
    },
    messageInfo: {
      fontSize: "12px",
      marginTop: "4px",
      color: "#999",
    },
    messageUser: {
      fontWeight: "bold",
      marginTop: "8px",
      fontSize: "14px",
    },
    inputContainer: {
      padding: "16px",
      borderTop: "1px solid #ccc",
      display: "flex",
      alignItems: "center",
    },
    inputField: {
      flex: "1",

      marginRight: "8px",
      fontSize: "14px",
    },
    sendButton: {
      padding: "8px 16px",
      borderRadius: "20px",
      backgroundColor: theme.palette.primary.main,
      color: "#fff",
      fontSize: "14px",
      border: "none",
      cursor: "pointer",
    },
  };

  return (
    <>
      {isLoading && chat !== null ? (
        <SkeletonTotalGrowthBarChart />
      ) : chat == null || chat == undefined ? (
        <Paper style={styles.container}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              flexDirection: "column",
            }}
          >
            <Typography variant="h3" style={{ marginBottom: 10 }}>
              Δεν έχει επιλεχτεί κάποια συνομιλία
            </Typography>

            <img src={chatImage} width="200" />
          </div>
        </Paper>
      ) : (
        <Paper style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <div style={{ display: "flex" }}>
              <Avatar style={styles.avatar}>
                <AiFillEdit style={{ color: theme.palette.primary.light }} />
              </Avatar>

              <div>
                <Typography variant="h3" style={styles.headerText}>
                  {chat?.user}
                </Typography>
                {messageList.length > 0 && (
                  <Typography variant="subtitle2" style={styles.subHeaderText}>
                    Επιλεγμένη Συνομιλία
                  </Typography>
                )}
              </div>
            </div>
            <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.largeAvatar,
                backgroundColor:
                  chat.adminRead || localRead ? "lightgreen" : "lightgray",
                color: "gray",
              }}
              onClick={() => {
                setOpenModal(true);
              }}
            >
              <MarkChatReadIcon
                style={
                  chat.adminRead || localRead
                    ? { color: theme.palette.primary.main }
                    : { color: "gray" }
                }
              />
            </Avatar>
          </div>

          {/* Chat Container */}
          <div style={styles.chatContainer} ref={chatContainerRef}>
            {messageList
              .slice()
              .reverse()
              .map((message) => (
                <SingleMessage message={message} />
              ))}
          </div>

          {/* Input Container */}
          <div style={styles.inputContainer}>
            <TextField
              type="text"
              value={newMessage}
              onChange={(event) => setnewMessage(event.target.value)}
              style={styles.inputField}
              fullWidth
              size="small"
              placeholder="Γράψτε ένα μήνυμα..."
            />
            {/* <button style={styles.sendButton} onClick={sendMessageFunction} 
            >
              Send
            </button> */}

            {messageLoading ? (
              <IconButton
                color="primary"
                sx={{ p: "10px" }}
                aria-label="directions"
              >
                <CircularProgress size={20} />
              </IconButton>
            ) : (
              <IconButton
                color="primary"
                sx={{ p: "10px", background: theme.palette.primary.dark }}
                aria-label="directions"
                onClick={sendMessageFunction}
              >
                <SendIcon style={{ color: theme.palette.primary.light }} />
              </IconButton>
            )}
          </div>
        </Paper>
      )}

      {/* Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* Title */}
          <Typography id="modal-modal-title" variant="h3" component="h2">
            Επισήμανση ως "Διαβάστηκε"
          </Typography>
          {/* Content */}
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Είστε σίγουρος/η ότι θέλετε να επισημάνετε την επιλεγμένη συνομιλία
            ως "Διαβάστηκε" για όλους τους διαχειριστές;
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
                  background: theme.palette.primary.dark,
                  color: "white",
                }}
                onClick={handleMarkAsRead}
              >
                Διαβάστηκε
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
};

ChatCard.propTypes = {
  isLoading: PropTypes.bool,
};

export default ChatCard;
