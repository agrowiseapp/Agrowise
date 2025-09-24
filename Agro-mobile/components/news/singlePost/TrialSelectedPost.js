import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
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
import { useNavigation } from "@react-navigation/native";

const TrialSelectedPost = ({ id, index, showModal, setShowModal, data }) => {
  const [post, setpost] = useState(null);
  const [commentsArray, setcommentsArray] = useState(null);
  const scrollViewRef = useRef(null);
  const [scrollToBottom, setScrollToBottom] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (scrollViewRef.current && scrollToBottom) {
      scrollViewRef.current.scrollToEnd({ animated: true });
      setScrollToBottom(false);
    }
  }, [commentsArray]);

  const closeModal = () => {
    setShowModal(false);
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
            <SimpleIcons name="arrow-back" size={30} color="white" />
            <Text style={styles.backButtonText}>Πίσω</Text>
          </TouchableOpacity>

          <Text style={styles.titleText}>
            {data?.title !== undefined && data.title}
          </Text>

          <View
            style={[
              styles.dateContainer,
              { backgroundColor: colors.Second[500] },
            ]}
          >
            <Text style={styles.dateText}>
              {data?.publishedAt !== null && (
                <DateSinceNow date={data?.publishedAt} />
              )}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.contentScrollView}
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
            <KeyboardAwareScrollView>
              <PostContent data={data} setShowModal={setShowModal} />

              <View style={styles.premiumUpgradeCard}>
                <View style={styles.premiumIconContainer}>
                  <Text style={styles.premiumIcon}>👑</Text>
                </View>
                <View style={styles.premiumContent}>
                  <Text style={styles.premiumTitle}>Ξεκλειδώστε τα σχόλια</Text>
                  <Text style={styles.premiumDescription}>
                    Αναβαθμίστε σε Premium για απεριόριστα σχόλια και πρόσβαση
                    σε όλες τις λειτουργίες
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.premiumButton}
                  onPress={() => navigation.navigate("SubscriptionScreen")}
                >
                  <Text style={styles.premiumButtonText}>Αναβάθμιση</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAwareScrollView>
          )}
        </ScrollView>
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
    fontSize: 24,
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
    borderRadius: 9999,
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
    backgroundColor: "#f3f4f6",
    flex: 1,
    width: "100%",
    padding: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "100%",
  },
  premiumUpgradeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    marginHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.Second[500],
  },
  premiumIconContainer: {
    marginRight: 16,
  },
  premiumIcon: {
    fontSize: 32,
  },
  premiumContent: {
    flex: 1,
    marginRight: 12,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.Text.primary,
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: 13,
    color: colors.Text.secondary,
    lineHeight: 18,
  },
  premiumButton: {
    backgroundColor: colors.Main[500],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  premiumButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default TrialSelectedPost;
