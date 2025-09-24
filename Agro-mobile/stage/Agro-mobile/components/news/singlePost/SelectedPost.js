import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Comments from "../comments/Comments";
import PostContent from "./PostContent";
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import colors, { Main } from "../../../assets/Theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  // 1) Data
  const [post, setpost] = useState(null);
  const [commentsArray, setcommentsArray] = useState(null);
  const scrollViewRef = useRef(null);
  const [scrollToBottom, setScrollToBottom] = useState(true);
  const [loading, setLoading] = useState(false);

  // 2) useEffects
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

  //3) Functions
  const closeModal = () => {
    setShowModal(false);
    onCommentPosted();
  };

  const getSpecificPostFunction = async () => {
    try {
      setLoading(true);
      let userToken = await AsyncStorage.getItem("userToken");
      //console.log("ID :", id);

      const response = await getSpecificPostApi("apiUrl", id, userToken);
      const data = await response.json();

      //console.log("Specific POST : ", data.response.post);
      //console.log("Specific Comment : CALLED");

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
        //console.log("COMMENTS NOTIFICATIONS :", int);

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
        className="flex-1 items-center"
        style={{ backgroundColor: colors.Main[600] }}
      >
        {/* Date Display */}

        <View
          className="relative w-full overflow-visible z-10"
          style={{ overflow: "visible", backgroundColor: colors.Main[600] }}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={closeModal}
            className="mt-16 items-center  p-1 ml-1 flex-row "
          >
            <Ionicons name="chevron-back" size={36} color="white" />
            <Text className="text-white text-xl">Πίσω</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text className="text-lg text-white font-semibold px-5 pt-2  pb-6">
            {post?.title !== undefined && post.title}
          </Text>

          {/* Date */}
          <View
            className="absolute -bottom-5 right-5 py-2 px-3 rounded-full z-50 shadow-sm"
            style={{ backgroundColor: colors.Second[500] }}
          >
            <Text className="text-base text-white ">
              {post?.publishedAt !== null && (
                <DateSinceNow date={post?.publishedAt} />
              )}
            </Text>
          </View>
        </View>

        {/* Content */}

        <ScrollView
          className="bg-gray-100 flex-1 w-full p-3 rounded-t-3xl"
          style={{ height: "100%" }}
          contentContainerStyle={{ flexGrow: 1 }}
          ref={scrollViewRef}
          onContentSizeChange={(contentWidth, contentHeight) => {
            if (scrollToBottom) {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }
          }}
        >
          {loading ? (
            <Loading />
          ) : (
            <KeyboardAwareScrollView
            //extraScrollHeight={Platform.select({ ios: 5, android: 100 })}
            >
              {/* Article */}
              <PostContent data={post} setShowModal={setShowModal} />

              {/* Comments */}
              <View className="mt-10 mb-10 px-1">
                <Comments
                  list={commentsArray}
                  setList={setcommentsArray}
                  date={post?.publishedAt}
                  postId={id}
                  getSpecificPostFunction={getSpecificPostFunction}
                />
              </View>
            </KeyboardAwareScrollView>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default SelectedPost;
