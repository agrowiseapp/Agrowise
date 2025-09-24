import { View, Text } from "react-native";
import React from "react";
import DateSinceNow from "../utils/DateSinceNow";
import colors from "../../assets/Theme/colors";

const SingleMessage = ({ text, createdAt, user }) => {
  const isMine = user?._id === 1 ? true : false;

  const wrapperStyle = isMine
    ? {
        alignSelf: "flex-end",
        backgroundColor: colors.Main[600], // Change background color of user's messages
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginBottom: 10,
        marginLeft: 50,
        maxWidth: "80%",
      }
    : {
        alignSelf: "flex-start",

        backgroundColor: "#fff", // Change background color of other messages
        borderRadius: 20,
        borderColor: "lightgray",
        borderWidth: "1px",
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginBottom: 10,
        marginRight: 50,
        maxWidth: "80%",
        overflow: "auto",
      };

  const textStyle = {
    color: isMine ? "#fff" : "#333", // Change color of the message text
  };

  const textStyleDate = {
    color: isMine ? colors.Main[200] : "gray", // Change color of the message text
  };

  return (
    <View style={wrapperStyle}>
      <Text style={textStyle} className="text-base ">
        {text}
      </Text>
      <View className="flex-col ">
        {!isMine && (
          <Text style={textStyleDate} className="text-sm font-light">
            {user?.name}
          </Text>
        )}
        <Text style={textStyleDate}>
          <DateSinceNow date={createdAt} />
        </Text>
      </View>
    </View>
  );
};

export default SingleMessage;
