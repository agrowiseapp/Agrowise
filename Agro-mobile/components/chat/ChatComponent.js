import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import SimpleIcons from "../icons/SimpleIcons";
import colors from "../../assets/Theme/colors";
import DateSinceNow from "../utils/DateSinceNow";

const ChatComponent = ({ messages, onOpenInput }) => {
  // Layout
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
      {messages.length > 0 ? (
        <FlatList
          data={messages}
          renderItem={({ item }) => <RenderMessage item={item} />}
          keyExtractor={(item, index) => index.toString()}
          inverted={true}
          initialNumToRender={2}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 10, paddingBottom: 10 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />
      ) : (
        <View style={{ flex: 1 }} />
      )}

      {/* Fake Input - Opens Modal */}
      <TouchableOpacity
        onPress={onOpenInput}
        activeOpacity={0.7}
        style={styles.inputContainer}
      >
        <View style={styles.input}>
          <Text style={styles.placeholderText}>Γράψτε ένα μήνυμα..</Text>
        </View>
        <View style={styles.sendButton}>
          <SimpleIcons name="send" size={20} color={colors.Text?.secondary || "#666"} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.Border?.light || "#e5e7eb",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.Border?.light || "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.Background?.primary || "#f9fafb",
    marginRight: 8,
    justifyContent: "center",
  },
  placeholderText: {
    color: colors.Text?.secondary || "#666",
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.Border?.light || "#e5e7eb",
  },
});

export default ChatComponent;
