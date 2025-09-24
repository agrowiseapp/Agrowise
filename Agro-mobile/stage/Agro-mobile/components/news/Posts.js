import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import SelectedPost from "./singlePost/SelectedPost";
import colors from "../../assets/Theme/colors";
import DateSinceNow from "../utils/DateSinceNow";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const Posts = ({ data, index, onCommentPosted }) => {
  // 1) Data
  const [showModal, setShowModal] = useState(false);

  // 2) UseEffect
  useEffect(() => {
    // console.log("Show Modal :", showModal);
    //console.log("Show DATA :", data);

    return;
  }, [showModal]);

  return (
    <>
      {/* All post display */}
      <TouchableOpacity
        style={{ backgroundColor: "#fff" }}
        className=" rounded-xl p-3 mx-3 my-2  shadow-sm"
        onPress={() => setShowModal(true)}
      >
        <View className="">
          {/* Colored Box Area */}
          <View className="flex-row items-center border-b border-gray-300 pb-1">
            <View className="mr-1">
              <Ionicons name="newspaper" size={16} color={colors.Main[700]} />
            </View>

            <Text className="m-1 text-gray-500">
              {data.author !== null &&
                (data.author == null ? "Διαχειριστής" : data.author)}
            </Text>
            {/* Notifications */}
            {data.unreadComments > 0 && (
              <View className="flex-row bg-red-500 rounded-lg px-2 py-1 items-center">
                <Feather name="bell" size={13} style={{ color: "white" }} />
              </View>
            )}
          </View>

          {/* Text Area */}
          <View className="">
            {/* Title */}
            <Text
              style={{ color: colors.Main[900] }}
              className="font-semibold text-lg"
            >
              {data.title}
            </Text>

            {/* Short Text */}
            <View className="mb-2">
              <Text
                numberOfLines={3}
                className=" text-base"
                style={{ color: colors.Main[700] }}
              >
                {data.text}
              </Text>
            </View>

            {/* Comments */}
            <View className="flex-row justify-between w-full">
              <View className="flex-row items-center flex-1 ">
                {data.comments > 0 && (
                  <>
                    <FontAwesome5
                      name="comment-alt"
                      size={15}
                      color={colors.Second[500]}
                    />
                    <Text className=" text text-Second-500 ml-1 ">
                      {data.comments}
                    </Text>
                  </>
                )}
              </View>

              {/* Date */}
              <View className="flex-row items-center flex-1  justify-end">
                {/* Date and comments */}
                <Text className="ml-1 text-gray-500">
                  {data.publishedAt != null && (
                    <DateSinceNow date={data.publishedAt} />
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Selected Post Modal Page */}
      <SelectedPost
        id={data._id}
        index={index}
        showModal={showModal}
        setShowModal={setShowModal}
        onCommentPosted={onCommentPosted}
      />
    </>
  );
};

export default Posts;
