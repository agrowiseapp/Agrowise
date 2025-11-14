import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import SingleComment from "./SingleComment";
import colors from "../../../assets/Theme/colors";
import { postNewCommentApi } from "../../../apis/CommentsApi";
import AsyncStorage from "../../../utils/AsyncStorage";
import Loading from "../../structure/Loading";
import SimpleIcons from "../../icons/SimpleIcons";
import checkForBadWordsAndAlert from "../../utils/checkForBadWordsAndAlert";

const Comments = ({
  list,
  setList,
  date,
  postId,
  getSpecificPostFunction,
  scrollViewRef,
  showInput = true,
  showInputOnly = false,
  useFakeInput = false, // New prop for fake input mode
  onOpenInput, // Callback to open modal
  comment, // External comment state (for modal)
  setcomment: setCommentExternal, // External comment setter
  postCommentLoading: externalLoading, // External loading state
  onSendComment, // External send handler
}) => {
  //1) Data - Use external state if provided, otherwise internal
  const [internalComment, setInternalComment] = useState(null);
  const [loading, setloading] = useState(false);
  const [internalPostCommentLoading, setInternalPostCommentLoading] = useState(false);

  // Use external or internal state
  const commentValue = useFakeInput ? comment : internalComment;
  const setCommentValue = useFakeInput ? setCommentExternal : setInternalComment;
  const postCommentLoading = useFakeInput ? externalLoading : internalPostCommentLoading;

  //2) UseEffect

  //3) Functions

  const postCommentFunction = async () => {
    if (commentValue == null || commentValue == "") {
      return;
    }
    try {
      // Filter the comment for bad words
      const hasBadWords = checkForBadWordsAndAlert(commentValue);

      if (hasBadWords) {
        // The comment contains bad words, handle the situation accordingly
        console.log("Comment contains bad words, please revise it.");
        Alert.alert("Το σχόλιο περιέχει μη επιτρεπτό κείμενο!");
        return;
      }

      setInternalPostCommentLoading(true);

      let userToken = await AsyncStorage.getItem("userToken");
      let userInfo = await AsyncStorage.getItem("userInfo");
      let parsedUserInfo = await JSON.parse(userInfo);

      let fullName = "";
      if (parsedUserInfo.isAdmin) {
        fullName =
          parsedUserInfo.firstName +
          " " +
          parsedUserInfo.lastName +
          " - (Διαχειριστής)";
      } else {
        fullName = parsedUserInfo.firstName + " " + parsedUserInfo.lastName;
      }

      let bodyObject = {
        postId: postId,
        authorId: parsedUserInfo.userId,
        author: fullName,
        content: commentValue,
        isMine: true,
        authorAvatar: parsedUserInfo.avatar,
      };

      const response = await postNewCommentApi("apiUrl", bodyObject, userToken);
      const data = await response.json();

      if (data?.resultCode == 0) {
        setCommentValue(null);
        setInternalPostCommentLoading(false);
        getSpecificPostFunction();
        await setloading(false);
      }
    } catch (error) {
      console.log("Error posting comment :", error);
      await setloading(false);
    }
  };

  // If only showing input (fixed at bottom)
  if (showInputOnly) {
    // Fake input mode - just a touchable that opens modal
    if (useFakeInput) {
      return (
        <TouchableOpacity
          onPress={onOpenInput}
          activeOpacity={0.7}
          style={styles.fixedInputContainer}
        >
          <View style={styles.fakeTextInput}>
            <Text style={styles.placeholderText}>
              Γράψε ένα σχόλιο..
            </Text>
          </View>
          <View style={styles.fakeSendButton}>
            <SimpleIcons name="send" size={20} color={colors.Text?.secondary || "#666"} />
          </View>
        </TouchableOpacity>
      );
    }

    // Real input mode (original behavior)
    return (
      <View style={styles.fixedInputContainer}>
        <TextInput
          style={styles.textInput}
          onChangeText={setCommentValue}
          value={commentValue}
          placeholder="Γράψε ένα σχόλιο.."
          placeholderTextColor="gray"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: !postCommentLoading
                ? colors.Main[600]
                : colors.Third[500],
            },
          ]}
          onPress={() => {
            if (!postCommentLoading) postCommentFunction();
          }}
          disabled={postCommentLoading}
        >
          {postCommentLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <SimpleIcons name="send" size={22} color="white" />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Comments header and button */}
      <View style={styles.header}>
        <SimpleIcons name="message" size={16} color={colors.Main[600]} />
        <Text style={[styles.headerText, { color: colors.Main[600] }]}>
          Σχόλια
        </Text>
      </View>

      {/* Existing comments */}
      {loading ? (
        <View>
          <Loading />
        </View>
      ) : (
        <View style={styles.commentsList}>
          {list?.map((e, index) => {
            return (
              <SingleComment
                content={e}
                key={index}
                getSpecificPostFunction={getSpecificPostFunction}
              />
            );
          })}
        </View>
      )}

      {/* Comment Input - Only show if showInput is true */}
      {showInput && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            onChangeText={setCommentValue}
            value={commentValue}
            placeholder="Γράψε ένα σχόλιο.."
            placeholderTextColor="gray"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: !postCommentLoading
                  ? colors.Main[600]
                  : colors.Third[500],
              },
            ]}
            onPress={() => {
              if (!postCommentLoading) postCommentFunction();
            }}
            disabled={postCommentLoading}
          >
            {postCommentLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <SimpleIcons name="send" size={22} color="white" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  headerText: {
    fontSize: 18,
    marginLeft: 4,
  },
  commentsList: {
    marginTop: 4,
    flexDirection: "column",
    padding: 8,
    width: "100%",
  },
  inputContainer: {
    marginVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  fixedInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: colors.Border?.light || "#e5e7eb",
    width: "100%",
  },
  textInput: {
    backgroundColor: "#e5e7eb", // bg-gray-200
    padding: 12,
    borderRadius: 9999, // rounded-full
    flex: 1,
    marginRight: 8,
  },
  sendButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 9999, // rounded-full
    flex: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  fakeTextInput: {
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
  fakeSendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.Border?.light || "#e5e7eb",
  },
});

export default Comments;
