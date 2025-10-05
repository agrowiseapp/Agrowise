import React, { useEffect, useState, useRef } from "react";
import {
  Grid,
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import withDrawer from "../../layout/withDrawer";
import MainCard from "../../components/ui/cards/MainCard";
import {
  getRecentGroupMessagesApi,
  sendGroupMessageApi,
} from "../../api/GroupChatApi";
import settings from "../../../package.json";

function GroupChat() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const theme = useTheme();
  const User = useSelector((state) => state.User.value);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const url = settings["appSettings :"].baseUrl;
      const token = User.Token;

      const response = await getRecentGroupMessagesApi(url, token, 100);
      const data = await response.json();

      if (data.resultCode === 0) {
        setMessages((data.response.messages || []).reverse());
        setTimeout(scrollToBottom, 100);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Αποτυχία φόρτωσης μηνυμάτων");
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;

    try {
      setSending(true);
      const url = settings["appSettings :"].baseUrl;
      const token = User.Token;

      // Get user info from nested User.User object
      const userId = User.User?.userId;
      const firstName = User.User?.firstName || "";
      const lastName = User.User?.lastName || "";
      const authorName = `${firstName} ${lastName}`.trim() || User.User?.email || "Admin";

      if (!userId) {
        setError("Σφάλμα: Δεν βρέθηκε το ID χρήστη. Παρακαλώ συνδεθείτε ξανά.");
        setSending(false);
        return;
      }

      const messageBody = {
        message: inputText.trim(),
        authorName: authorName,
        userId: userId,
      };

      console.log("Sending message:", messageBody);

      const response = await sendGroupMessageApi(url, messageBody, token);
      const data = await response.json();

      if (data.resultCode === 0) {
        setInputText("");
        await fetchMessages();
      } else {
        setError(data.message || "Αποτυχία αποστολής μηνύματος");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Αποτυχία αποστολής μηνύματος");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    intervalRef.current = setInterval(() => {
      fetchMessages();
    }, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("el-GR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid item xs={12} md={10} lg={8}>
        <MainCard
          title="Ομαδικό Chat"
          secondary={
            <IconButton
              onClick={fetchMessages}
              disabled={loading}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "white",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
                "&.Mui-disabled": {
                  backgroundColor: theme.palette.grey[300],
                  color: theme.palette.grey[500],
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          }
          content={false}
          sx={{
            "& .MuiCardHeader-root": {
              py: 1.5,
              px: 3,
            }
          }}
        >
            {error && (
              <Alert
                severity="error"
                sx={{ m: 2 }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            <Box
              sx={{
                height: "calc(100vh - 300px)",
                minHeight: "500px",
                maxHeight: "700px",
                overflowY: "auto",
                p: 3,
                backgroundColor: "#ffffff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <List sx={{ display: "flex", flexDirection: "column" }}>
                  {messages.length === 0 ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="100%"
                    >
                      <Typography variant="body2" color="text.secondary">
                        Δεν υπάρχουν μηνύματα ακόμα. Στείλτε το πρώτο!
                      </Typography>
                    </Box>
                  ) : (
                    messages
                      .map((msg) => {
                        const isCurrentUser =
                          msg.userId === User.User?.userId || msg.userId?._id === User.User?.userId;

                        return (
                        <ListItem
                          key={msg._id}
                          sx={{
                            flexDirection: "column",
                            alignItems: isCurrentUser
                              ? "flex-end"
                              : "flex-start",
                            mb: 0.5,
                            px: 0,
                            py: 0.25,
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: "60%",
                              backgroundColor: isCurrentUser
                                ? "#4caf50"
                                : "#e4e6eb",
                              color: isCurrentUser ? "white" : "#050505",
                              borderRadius: isCurrentUser
                                ? "18px 18px 4px 18px"
                                : "18px 18px 18px 4px",
                              px: 1.5,
                              py: 1,
                              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            }}
                          >
                            {!isCurrentUser && (
                              <Typography
                                variant="caption"
                                fontWeight="600"
                                display="block"
                                sx={{ mb: 0.3, fontSize: "0.7rem" }}
                              >
                                {msg.authorName}
                              </Typography>
                            )}
                            <Typography variant="body2" sx={{ mb: 0.3, fontSize: "0.9rem", lineHeight: 1.4 }}>
                              {msg.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                opacity: 0.7,
                                display: "block",
                                textAlign: "right",
                                fontSize: "0.65rem",
                              }}
                            >
                              {formatTime(msg.date)}
                            </Typography>
                          </Box>
                        </ListItem>
                        );
                      })
                  )}
                  <div ref={messagesEndRef} />
                </List>
              )}
            </Box>

            <Box
              display="flex"
              gap={1}
              sx={{
                p: 2,
                backgroundColor: theme.palette.background.paper,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Γράψτε ένα μήνυμα..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending}
                multiline
                maxRows={3}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || sending}
              >
                {sending ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default withDrawer(GroupChat);
