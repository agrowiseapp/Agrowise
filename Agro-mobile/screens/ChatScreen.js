import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useRef, useState } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import colors from "../assets/Theme/colors";
import ScreenTitle from "../components/structure/ScreenTitle";
import SimpleIcons from "../components/icons/SimpleIcons";
import {
  createAnimatableComponent,
  View as AnimatableView,
} from "react-native-animatable";
import LoadingComponent from "../components/structure/LoadingComponent";
import {
  getSpecificChatApi,
  postCreateNewChatApi,
  postSendMessageApi,
  readChatApi,
} from "../apis/ChatApi";
import AsyncStorage from "../utils/AsyncStorage";
import ChatComponent from "../components/chat/ChatComponent";
import { useNavigation } from "@react-navigation/native";
import { UserInfoApi } from "../apis/LoginApi";
import SubBottomScreen from "../components/subscriptions/SubBottomScreen";
import useRevenueCat from "../hooks/useRevenueCat";

const AnimatedView = createAnimatableComponent(AnimatableView);

const ChatScreen = ({ route }) => {
  // 1) Data
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSendMessage, setLoadingSendMessage] = useState(false);
  const [chatExists, setchatExists] = useState(false);
  const [intervalID, setintervalID] = useState(null);
  const intervalRef = useRef(null);
  const navigation = useNavigation();
  const [isProMember, setisProMember] = useState(false);
  const [openSubBottomScreen, setopenSubBottomScreen] = useState(false);

  // 2) UseEffect
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", onLandExcecute);
    const unsubscribe2 = navigation.addListener("blur", () => {
      clearInterval(intervalRef.current);
      console.log("UNSUBSCRIBE");
    });

    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, [navigation]);

  // 3) Functions
  const onLandExcecute = async () => {
    MembershipCheckFunction();
    try {
      let chatExists = await getChatInfo();
      if (chatExists) {
        getSpecificChatFunction();
        readChatFunction();

        const intervalId = setInterval(() => {
          getSpecificChatFunction();
          console.log("called fetched the messages");
        }, 15 * 1000);
        intervalRef.current = intervalId;
        setchatExists(true);

        return () => {
          clearInterval(intervalRef.current);
        };
      } else {
        setchatExists(false);
      }
    } catch (error) {
      console.log("Error :", error);
    }
  };

  const MembershipCheckFunction = async () => {
    let MembershipCheck = await AsyncStorage.getItem("ProMembership");
    if (MembershipCheck == "true") {
      setisProMember(true);
    } else {
      setisProMember(false);
    }
  };

  const getChatInfo = async () => {
    let MembershipCheck = await AsyncStorage.getItem("ProMembership");
    if (MembershipCheck !== "true") {
      return;
    }
    try {
      let chatID = await AsyncStorage.getItem("chatId");
      if (chatID !== null && chatID !== "") {
        return true;
      } else {
        let checkDB = await getUserInfoFunction();
        if (checkDB) return true;
        return false;
      }
    } catch (error) {
      console.log("Error trying to get Chat ID from storage");
    }
  };

  const getUserInfoFunction = async () => {
    try {
      let token = await AsyncStorage.getItem("userToken");
      const response = await UserInfoApi("apiUrl", token);
      const data = await response.json();
      if (data?.resultCode == 0) {
        let user = data?.response;
        if (user.chatId !== undefined) {
          AsyncStorage.setItem("chatId", user.chatId);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.log("Error :", error);
      return false;
    }
  };

  const getSpecificChatFunction = async () => {
    try {
      let chatID = await AsyncStorage.getItem("chatId");
      if (chatID == null || chatID === "") {
        return;
      }
      let userToken = await AsyncStorage.getItem("userToken");
      const response = await getSpecificChatApi("apiUrl", chatID, userToken);
      if (response.status >= 400) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data?.resultCode === 0) {
        const newMessages = data.response.messages;
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          const newLastMessage = newMessages[newMessages.length - 1];
          if (lastMessage?.text !== newLastMessage?.text) {
            setMessages(newMessages);
            console.log("Chat Fetched Successfully");
          }
        } else {
          setMessages(newMessages);
        }
      } else {
        console.log("Error :", error);
        Alert.alert(
          "Πρόβλημα σύνδεσης.",
          "Ο Λογαριασμός σας ήταν πολύ ώρα σε αδράνεια. Παρακαλώ συνδεθείτε ξανα.",
          [
            {
              text: "Αποσύνδεση",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    } catch (error) {
      console.log("getSpecificChatFunction :", error);
      clearInterval(intervalID);
      Alert.alert(
        "Πρόβλημα σύνδεσης.",
        "Ο Λογαριασμός σας ήταν πολύ ώρα σε αδράνεια. Παρακαλώ συνδεθείτε ξανα.",
        [
          {
            text: "Αποσύνδεση",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    }
  };

  const readChatFunction = async () => {
    try {
      let chatID = await AsyncStorage.getItem("chatId");
      let userToken = await AsyncStorage.getItem("userToken");
      let bodyObject = {
        chatId: chatID,
        userRead: true,
      };
      const response = await readChatApi("apiUrl", bodyObject, userToken);
      const data = await response.json();
      console.log("Data response from read chat : ", data);
      if (data?.resultCode == 0) {
        // getSpecificChatFunction();
      }
    } catch (error) {
      console.log("Error on read chat :", error);
    }
  };

  const sendMessageFunction = async (newMessage) => {
    if (newMessage == "") return;
    try {
      setLoadingSendMessage(true);
      let userToken = await AsyncStorage.getItem("userToken");
      let userInfo = await AsyncStorage.getItem("userInfo");
      let parsedUserInfo = await JSON.parse(userInfo);
      let chatID = await AsyncStorage.getItem("chatId");
      let fullName = parsedUserInfo.firstName + " " + parsedUserInfo.lastName;
      let bodyObject = {
        author: fullName,
        authorId: parsedUserInfo.userId,
        text: newMessage,
        chatId: chatID,
        userType: parsedUserInfo.isAdmin ? 1 : 0,
      };

      if (chatID !== null && chatID !== "") {
        bodyObject.chatId = chatID;
      }
      console.log("OBJECT :", bodyObject);

      const response = await postSendMessageApi(
        "apiUrl",
        bodyObject,
        userToken
      );
      const data = await response.json();
      if (data?.resultCode == 0) {
        let localMessage = {
          _id: data.response.id,
          createdAt: data.response.publishedAt,
          text: bodyObject.text,
          user: {
            _id: 1,
            name: bodyObject.author,
          },
        };
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, localMessage)
        );
      }
      setLoadingSendMessage(false);
    } catch (error) {
      console.log("sendMessageFunction :", error);
      setLoadingSendMessage(false);
    }
  };

  const onSend = (newMessage) => {
    console.log("Clicked with Message ");
    sendMessageFunction(newMessage);
  };

  const createChatFunction = async () => {
    try {
      setLoading(true);
      let userToken = await AsyncStorage.getItem("userToken");
      let userInfo = await AsyncStorage.getItem("userInfo");
      let parsedUserInfo = await JSON.parse(userInfo);
      let fullName = parsedUserInfo.firstName + " " + parsedUserInfo.lastName;
      let bodyObject = {
        userId: parsedUserInfo.userId,
        user: fullName,
        participants: parsedUserInfo.userId,
        avatar: parsedUserInfo.avatar,
      };

      const response = await postCreateNewChatApi(
        "apiUrl",
        bodyObject,
        userToken
      );
      const data = await response.json();
      if (data?.resultCode == 0) {
        console.log("Chat Created Successfully with :", data.response);
        AsyncStorage.setItem("chatId", data.response);
        setchatExists(true);
      }
      setLoading(false);
    } catch (error) {
      console.log("createChatFunction :", error);
    }
  };

  const createChatOropenSub = async () => {
    if (!isProMember) {
      console.log("Must open the bottom sheet with the subscription");
      setopenSubBottomScreen(true);
    } else {
      createChatFunction();
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <AnimatedView style={styles.animatedView}>
          {openSubBottomScreen ? (
            <SubBottomScreen setopenSubBottomScreen={setopenSubBottomScreen} />
          ) : (
            <>
              <View style={styles.headerContainer}>
                <ScreenTitle
                  title="Επικοινωνία"
                  back={true}
                  navigation={navigation}
                />
              </View>

              <View style={styles.contentContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <LoadingComponent />
                </View>
              ) : chatExists ? (
                <>
                  <ChatComponent
                    messages={messages}
                    loadingSendMessage={loadingSendMessage}
                    onSend={onSend}
                  />
                </>
              ) : (
                <View style={styles.noChatContainer}>
                  <Text style={styles.noChatTitle}>
                    Χρειάζεσαι συμβουλή ή έχεις κάποια απορρία;
                  </Text>
                  <Text style={styles.noChatSubTitle}>
                    Επικοινωνήσε άμεσα με έναν σύμβουλο.
                  </Text>
                  <TouchableOpacity
                    style={styles.createChatButton}
                    onPress={createChatOropenSub}
                  >
                    <Text style={styles.createChatButtonText}>
                      Αποστολή μηνύματος.
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.websiteContainer}>
                    <SimpleIcons
                      name="globe"
                      size={24}
                      color={colors.Main[500]}
                    />
                    <Text style={styles.websiteText}>www.infoagro.gr</Text>
                  </View>

                  <View style={styles.phoneContainer}>
                    <SimpleIcons
                      name="phone"
                      size={24}
                      color={colors.Main[500]}
                    />
                    <Text style={styles.phoneText}>+30 6989593525</Text>
                  </View>
                </View>
              )}
              </View>
            </>
          )}
        </AnimatedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  animatedView: {
    flex: 1,
  },
  safeAreaView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noChatContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    textAlign: "center",
    margin: "auto",
  },
  noChatTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  noChatSubTitle: {
    fontSize: 16,
  },
  createChatButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#9ca3af",
    borderRadius: 9999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createChatButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  websiteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
  },
  websiteText: {
    color: "#6b7280",
    fontSize: 16,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  phoneText: {
    color: "#6b7280",
    fontSize: 16,
  },
});

export default ChatScreen;
