import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import SelectedPost from "./singlePost/SelectedPost";
import colors from "../../assets/Theme/colors";
import DateSinceNow from "../utils/DateSinceNow";
import SimpleIcons from "../icons/SimpleIcons";

const Posts = ({ data, index, onCommentPosted }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // This useEffect hook remains for potential future use or debugging
    return;
  }, [showModal]);

  return (
    <>
      <TouchableOpacity
        style={[styles.postContainer, { backgroundColor: "#fff" }]}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.coloredBoxArea}>
            <View style={styles.iconContainer}>
              <SimpleIcons
                name="newspaper"
                size={16}
                color={colors.Main[700]}
              />
            </View>

            <Text style={styles.authorText}>
              {data.author !== null &&
                (data.author == null ? "Διαχειριστής" : data.author)}
            </Text>
            {data.unreadComments > 0 && (
              <View style={styles.notificationBadge}>
                <SimpleIcons name="bell" size={13} style={{ color: "white" }} />
              </View>
            )}
          </View>

          <View style={styles.textArea}>
            <Text style={[styles.titleText, { color: colors.Main[900] }]}>
              {data.title}
            </Text>

            <View style={styles.shortTextContainer}>
              <Text
                numberOfLines={3}
                style={[styles.shortText, { color: "black" }]}
              >
                {data.text}
              </Text>
            </View>

            <View style={styles.footerContainer}>
              <View style={styles.commentsContainer}>
                {data.comments > 0 && (
                  <>
                    <SimpleIcons
                      name="message"
                      size={15}
                      color={colors.Second[500]}
                    />
                    <Text
                      style={[
                        styles.commentsText,
                        { color: colors.Second[500] },
                      ]}
                    >
                      {data.comments}
                    </Text>
                  </>
                )}
              </View>

              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>
                  {data.publishedAt != null && (
                    <DateSinceNow date={data.publishedAt} />
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

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

const styles = StyleSheet.create({
  postContainer: {
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  contentWrapper: {},
  coloredBoxArea: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 4,
  },
  iconContainer: {
    marginRight: 4,
  },
  authorText: {
    margin: 4,
    color: "#6b7280",
  },
  notificationBadge: {
    flexDirection: "row",
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  textArea: {},
  titleText: {
    fontWeight: "600",
    fontSize: 18,
  },
  shortTextContainer: {
    marginBottom: 8,
  },
  shortText: {
    fontSize: 16,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  commentsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  commentsText: {
    fontSize: 14,
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  dateText: {
    marginLeft: 4,
    color: "#6b7280",
  },
});

export default Posts;
