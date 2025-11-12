import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SimpleIcons from "../../icons/SimpleIcons";
import Comments from "../comments/Comments";
import PostContent from "./PostContent";
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import colors, { Main } from "../../../assets/Theme/colors";
import AsyncStorage from "../../../utils/AsyncStorage";
import { getSpecificPostApi } from "../../../apis/PostsApi";
import { getCommentsNotificationApi } from "../../../apis/NotificationsApi";
import Loading from "../../structure/Loading";
import DateSinceNow from "../../utils/DateSinceNow";

const SelectedPost = ({
  id,
  index,
  showModal,
  setShowModal,
  onCommentPosted,
}) => {
  const [post, setpost] = useState(null);
  const [commentsArray, setcommentsArray] = useState(null);
  const scrollViewRef = useRef(null);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal) {
      getSpecificPostFunction();
      const interval = setInterval(getSpecificPostFunction, 200 * 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [showModal]);

  useEffect(() => {
    if (scrollViewRef.current && scrollToBottom) {
      scrollViewRef.current.scrollToEnd({ animated: true });
      setScrollToBottom(false);
    }
  }, [commentsArray]);

  const closeModal = () => {
    setShowModal(false);
    onCommentPosted();
  };

  const getSpecificPostFunction = async () => {
    try {
      setLoading(true);
      let userToken = await AsyncStorage.getItem("userToken");

      const response = await getSpecificPostApi("apiUrl", id, userToken);
      const data = await response.json();

      await setpost(data?.response.post);
      await setcommentsArray(data?.response?.comments);
      getCommentsNotificationsFunction();
      setLoading(false);
    } catch (error) {
      console.log("Error : ", error);
    }
  };

  const getCommentsNotificationsFunction = async () => {
    try {
      let userToken = await AsyncStorage.getItem("userToken");

      const response = await getCommentsNotificationApi("url", userToken);
      const data = await response.json();

      if (data?.response?.resultCode === 0) {
        let comments_notification = data?.response?.data?.unreadComments.length;
        let int = parseInt(comments_notification);
        AsyncStorage.setItem("commentsNotifications", int.toString());
      }
    } catch (error) {
      console.log("Error on Notifications :", error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showModal}
      onRequestClose={() => {
        setShowModal(!showModal);
      }}
    >
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.Main[600] }]}
      >
        <View
          style={[
            styles.headerContainer,
            { backgroundColor: colors.Main[600] },
          ]}
        >
          <TouchableOpacity onPress={closeModal} style={styles.backButton}>
            <SimpleIcons name="arrow-back" size={36} color="white" />
            <Text style={styles.backButtonText}>Πίσω</Text>
          </TouchableOpacity>

          <Text style={styles.titleText}>
            {post?.title !== undefined && post.title}
          </Text>

          <View
            style={[
              styles.dateContainer,
              { backgroundColor: colors.Second[500] },
            ]}
          >
            <Text style={styles.dateText}>
              {post?.publishedAt !== null && (
                <DateSinceNow date={post?.publishedAt} />
              )}
            </Text>
          </View>
        </View>

        <KeyboardAwareScrollView
          style={styles.contentScrollView}
          contentContainerStyle={{ flexGrow: 1 }}
          ref={scrollViewRef}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <Loading />
          ) : (
            <>
              <PostContent data={post} setShowModal={setShowModal} />
              <View style={styles.commentsSection}>
                <Comments
                  list={commentsArray}
                  setList={setcommentsArray}
                  date={post?.publishedAt}
                  postId={id}
                  getSpecificPostFunction={getSpecificPostFunction}
                />
              </View>
            </>
          )}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: "center",
  },
  headerContainer: {
    position: "relative",
    width: "100%",
    zIndex: 10,
    overflow: "visible",
  },
  backButton: {
    marginTop: 64,
    alignItems: "center",
    padding: 4,
    marginLeft: 4,
    flexDirection: "row",
  },
  backButtonText: {
    color: "white",
    fontSize: 20,
  },
  titleText: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  dateContainer: {
    position: "absolute",
    bottom: -20,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999, // Corresponds to rounded-full
    zIndex: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    color: "white",
  },
  contentScrollView: {
    backgroundColor: "#f3f4f6", // Corresponds to bg-gray-100
    flex: 1,
    width: "100%",
    padding: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "100%",
  },
  commentsSection: {
    marginTop: 40,
    marginBottom: 40,
    paddingHorizontal: 4,
  },
});

export default SelectedPost;
