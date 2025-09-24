import { useTheme } from "@emotion/react";
import React from "react";
import DateSinceNow from "../../utils/DateSinceNow";

function SingleMessage({ message }) {
  const theme = useTheme();

  const styles = {
    sentMessage: {
      display: "flex",
      justifyContent: "flex-start",
      marginBottom: "1px",
      marginBottom: 5,
    },
    receivedMessage: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: "1px",
      marginBottom: 5,
    },
    messageOther: {
      backgroundColor: theme.palette.primary.light,
      color: "#fff",
      borderRadius: 15,
      padding: "8px 20px",
      maxWidth: "80%",
      wordBreak: "break-word",
      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 3px 0px",
    },
    messageMine: {
      backgroundColor: "#E4E6EB",
      color: "#333",
      borderRadius: 15,
      padding: "8px 20px 8px 10px",
      maxWidth: "80%",
      wordBreak: "break-word",
      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 3px 0px",
    },
    messageText: {
      fontSize: "15px",
    },
    messageInfoSender: {
      textAlign: "end",
      fontSize: "11px",
      color: "lightblue",
    },
    messageInfoReceiver: {
      textAlign: "start",
      fontSize: "11px",
      color: "#999",
    },
    messageUserSender: {
      textAlign: "start",
      fontWeight: 400,
      color: "gray",
      fontSize: "12px",
    },
    messageUserReceiver: {
      textAlign: "end",
      fontWeight: 400,
      color: "gray",
      fontSize: "12px",
    },
  };

  return (
    <>
      <div
        key={message._id}
        style={
          message.user._id === 2 ? styles.sentMessage : styles.receivedMessage
        }
      >
        <div
          style={
            message.user._id === 2 ? styles.messageMine : styles.messageOther
          }
        >
          <div style={styles.messageText}>{message.text}</div>
          <div
            style={
              message.user._id === 2
                ? styles.messageInfoReceiver
                : styles.messageInfoSender
            }
          >
            <DateSinceNow date={message.createdAt} />
          </div>
        </div>
      </div>
    </>
  );
}

export default SingleMessage;
