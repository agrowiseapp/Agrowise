import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import SingleMessage from "./SingleMessage";
import { Feather } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import colors from "../../assets/Theme/colors";
import DateSinceNow from "../utils/DateSinceNow";

const ChatComponent = ({ messages, loadingSendMessage, onSend }) => {
  //1) Data
  const [inputText, setInputText] = useState("");

  // 2) UseEffects
  useEffect(() => {
    //console.log("MESSAGES FROM COMPONENT :", messages);

    return;
  }, []);

  // 3) Functions

  const sendMessage = async () => {
    if (inputText == "") return;
    onSend(inputText);
    setInputText("");
  };

  // 4) Layout

  const RenderMessage = ({ item }) => {
    if (!item) {
      return null; // Skip rendering if item is undefined or null
    }
    let isMine = item.user?._id === 1 ? true : false;

    let myWrapper = {
      alignSelf: "flex-end",
      backgroundColor: colors.Main[600], // Change background color of user's messages
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 8,
      marginBottom: 10,
      marginLeft: 50,
      maxWidth: "80%",
    };

    let hisWrapper = {
      //alignSelf: "flex-start",

      // backgroundColor: "#fff", // Change background color of other messages
      borderRadius: 20,
      // borderColor: "lightgray",
      //borderWidth: "1px",
      paddingHorizontal: 15,
      paddingVertical: 8,
      marginBottom: 10,
      marginRight: 50,
      maxWidth: "80%",
      overflow: "auto",
    };

    const textStyle = {
      color: isMine ? "#fff" : "#333", // Change color of the message text
      fontSize: 16,
    };

    const textStyleDate = {
      color: isMine ? colors.Main[200] : "gray", // Change color of the message text
    };

    return item.user?._id == 1 ? (
      <View style={myWrapper}>
        <Text style={textStyle}>{item.text}</Text>
        <Text style={textStyleDate}>
          <DateSinceNow date={item.createdAt} />
        </Text>
      </View>
    ) : (
      <View className="bg-gray-300 px-5 max-w-xs py-2 mb-3 mr-5 overflow-auto rounded-3xl self-start">
        <Text style={textStyle}>{item.text}</Text>
        <Text style={textStyleDate}>
          <DateSinceNow date={item.createdAt} />
        </Text>
        <Text style={textStyleDate}> {"◎ Διαχειριστής"}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chat */}
      {messages.length > 0 && (
        <FlatList
          data={messages}
          renderItem={({ item, index }) => <RenderMessage item={item} />}
          keyExtractor={(item, index) => index.toString()}
          inverted={true}
          initialNumToRender={2}
        />
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Γράψτε ένα μήνυμα.."
          value={inputText}
          onChangeText={(text) => setInputText(text)}
        />
        <TouchableOpacity onPress={sendMessage}>
          {loadingSendMessage ? (
            <View className="bg-gray-300  py-2  px-5 rounded-full flex justify-center items-center">
              <AntDesign name="loading1" size={22} color="white" />
            </View>
          ) : (
            <View className="bg-Main-800  py-2  px-5 rounded-full flex justify-center items-center">
              <Feather name="send" size={22} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "lightgray",
    paddingTop: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#C0C0C0",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ChatComponent;
