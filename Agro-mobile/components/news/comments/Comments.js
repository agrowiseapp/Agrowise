import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import SingleComment from "./SingleComment";
import colors from "../../../assets/Theme/colors";
import { postNewCommentApi } from "../../../apis/CommentsApi";
import AsyncStorage from "../../../utils/AsyncStorage";
import Loading from "../../structure/Loading";
import SimpleIcons from "../../icons/SimpleIcons";
import checkForBadWordsAndAlert from "../../utils/checkForBadWordsAndAlert";

const Comments = ({ list, setList, date, postId, getSpecificPostFunction }) => {
  //1) Data
  const [comment, setcomment] = useState(null);
  const [loading, setloading] = useState(false);
  const [postCommentLoading, setpostCommentLoading] = useState(false);

  //2) UseEffect

  //3) Functions

  const postCommentFunction = async () => {
    if (comment == null || comment == "") {
      return;
    }
    try {
      // Filter the comment for bad words
      const hasBadWords = checkForBadWordsAndAlert(comment);

      if (hasBadWords) {
        // The comment contains bad words, handle the situation accordingly
        console.log("Comment contains bad words, please revise it.");
        Alert.alert("Το σχόλιο περιέχει μη επιτρεπτό κείμενο!");
        return;
      }

      setpostCommentLoading(true);

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
        content: comment,
        isMine: true,
        authorAvatar: parsedUserInfo.avatar,
      };

      const response = await postNewCommentApi("apiUrl", bodyObject, userToken);
      const data = await response.json();

      if (data?.resultCode == 0) {
        setcomment(null);
        setpostCommentLoading(false);
        getSpecificPostFunction();
        await setloading(false);
      }
    } catch (error) {
      console.log("Error posting comment :", error);
      await setloading(false);
    }
  };

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

      {/* Comment Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          onChangeText={setcomment}
          value={comment}
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
        >
          {postCommentLoading ? (
            <SimpleIcons name="loading1" size={22} color="gray" />
          ) : (
            <SimpleIcons name="send" size={22} color="white" />
          )}
        </TouchableOpacity>
      </View>
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
});

export default Comments;
