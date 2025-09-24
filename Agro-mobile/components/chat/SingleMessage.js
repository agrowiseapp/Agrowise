import { View, Text, StyleSheet } from "react-native";
import React from "react";
import DateSinceNow from "../utils/DateSinceNow";
import colors from "../../assets/Theme/colors";

const SingleMessage = ({ text, createdAt, user }) => {
  const isMine = user?._id === 1;

  return (
    <View style={isMine ? styles.myWrapper : styles.otherWrapper}>
      <Text
        style={[styles.messageText, isMine ? styles.myText : styles.otherText]}
      >
        {text}
      </Text>
      <View style={styles.detailsWrapper}>
        {!isMine && (
          <Text style={[styles.userNameText, styles.otherDateText]}>
            {user?.name}
          </Text>
        )}
        <Text
          style={[
            styles.dateText,
            isMine ? styles.myDateText : styles.otherDateText,
          ]}
        >
          <DateSinceNow date={createdAt} />
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  myWrapper: {
    alignSelf: "flex-end",
    backgroundColor: colors.Main[600],
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 10,
    marginLeft: 50,
    maxWidth: "80%",
  },
  otherWrapper: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 20,
    borderColor: "lightgray",
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 10,
    marginRight: 50,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 16, // Corresponds to text-base
  },
  myText: {
    color: "#fff",
  },
  otherText: {
    color: "#333",
  },
  detailsWrapper: {
    flexDirection: "column", // Corresponds to flex-col
  },
  userNameText: {
    fontSize: 14, // Corresponds to text-sm
    fontWeight: "300", // Corresponds to font-light
  },
  dateText: {
    fontSize: 14,
  },
  myDateText: {
    color: colors.Main[200],
  },
  otherDateText: {
    color: "gray",
  },
});

export default SingleMessage;
