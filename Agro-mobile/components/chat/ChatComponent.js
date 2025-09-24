import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import SimpleIcons from "../icons/SimpleIcons";
import colors from "../../assets/Theme/colors";
import DateSinceNow from "../utils/DateSinceNow";

const ChatComponent = ({ messages, loadingSendMessage, onSend }) => {
  //1) Data
  const [inputText, setInputText] = useState("");

  // 2) UseEffects
  useEffect(() => {
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
      return null;
    }
    const isMine = item.user?._id === 1;

    return (
      <View
        style={[
          isMine ? styles.myMessageWrapper : styles.otherMessageWrapper,
          isMine && { backgroundColor: colors.Main[600] },
        ]}
      >
        <Text
          style={[styles.textBase, isMine ? styles.myText : styles.otherText]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.textDate,
            isMine ? styles.myDateText : styles.otherDateText,
          ]}
        >
          <DateSinceNow date={item.createdAt} />
        </Text>
        {!isMine && (
          <Text style={styles.otherDateText}> {"◎ Διαχειριστής"}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chat */}
      {messages.length > 0 && (
        <FlatList
          data={messages}
          renderItem={({ item }) => <RenderMessage item={item} />}
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
        <TouchableOpacity
          onPress={sendMessage}
          style={[
            styles.sendButton,
            {
              backgroundColor: loadingSendMessage
                ? colors.Main[300] // A lighter color for loading state
                : colors.Main[800],
            },
          ]}
        >
          {loadingSendMessage ? (
            <SimpleIcons name="loading1" size={22} color="white" />
          ) : (
            <SimpleIcons name="send" size={22} color="white" />
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
  myMessageWrapper: {
    alignSelf: "flex-end",
    backgroundColor: colors.Main[600],
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 10,
    marginLeft: 50,
    maxWidth: "80%",
  },
  otherMessageWrapper: {
    alignSelf: "flex-start",
    backgroundColor: "#d1d5db", // Corresponds to bg-gray-300
    borderRadius: 24, // Corresponds to rounded-3xl
    paddingHorizontal: 20, // Corresponds to px-5
    paddingVertical: 8, // Corresponds to py-2
    marginBottom: 12, // Corresponds to mb-3
    marginRight: 20, // Corresponds to mr-5
    maxWidth: "80%",
  },
  textBase: {
    fontSize: 16,
  },
  myText: {
    color: "#fff",
  },
  otherText: {
    color: "#333",
  },
  textDate: {
    fontSize: 14,
    marginTop: 4,
  },
  myDateText: {
    color: colors.Main[200],
  },
  otherDateText: {
    color: "gray",
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
  sendButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 9999, // Corresponds to rounded-full
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatComponent;
