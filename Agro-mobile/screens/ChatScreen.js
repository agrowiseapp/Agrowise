import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useRef, useState } from "react";
import colors from "../assets/Theme/colors";
import ScreenTitle from "../components/structure/ScreenTitle";
import SimpleIcons from "../components/icons/SimpleIcons";
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
import socketService from "../services/socketService";
import { getBootstrapUrl } from "../apis/settings/bootstrapUrl";
import ChatInputModal from "../components/chat/ChatInputModal";

// Get backend URL from existing bootstrap configuration
const BACKEND_URL = getBootstrapUrl();

const ChatScreen = ({ route }) => {
  // 1) Data
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSendMessage, setLoadingSendMessage] = useState(false);
  const [chatExists, setchatExists] = useState(false);
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const intervalRef = useRef(null);
  const navigation = useNavigation();
  const [isProMember, setisProMember] = useState(false);
  const [openSubBottomScreen, setopenSubBottomScreen] = useState(false);

  // 2) UseEffect
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", onLandExcecute);
    const unsubscribe2 = navigation.addListener("blur", async () => {
      console.log("🔌 ChatScreen blur - cleaning up socket listeners");

      // Leave chat room and remove listeners
      const chatID = await AsyncStorage.getItem("chatId");
      if (chatID) {
        socketService.leaveChat(chatID);
      }
      socketService.offNewMessage();

      // Clear interval (kept for fallback compatibility)
      clearInterval(intervalRef.current);
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
        // Get chat ID from storage
        let chatID = await AsyncStorage.getItem("chatId");

        // Fetch initial messages
        getSpecificChatFunction();
        readChatFunction();

        // Connect to Socket.IO and join chat room
        const connected = await socketService.connect(BACKEND_URL);
        if (connected && chatID) {
          socketService.joinChat(chatID);

          // Listen for new messages via Socket.IO
          socketService.onNewMessage((newMessage) => {
            console.log("🔔 Received real-time message:", newMessage);
            setMessages((prevMessages) => {
              // Check if message already exists to avoid duplicates
              const exists = prevMessages.some(msg => msg._id === newMessage._id);
              if (!exists) {
                return [newMessage, ...prevMessages];
              }
              return prevMessages;
            });
          });
        }

        setchatExists(true);
      } else {
        setchatExists(false);
      }
    } catch (error) {
      console.log("Error :", error);
    }
  };

  const MembershipCheckFunction = async () => {
    try {
      // 🧪 Check if we're in development mode (bypassing payments)
      const { shouldBypassPayments } = require("../config/development");
      if (shouldBypassPayments()) {
        console.log("🧪 DEVELOPMENT MODE: Bypassing RevenueCat check, using mock subscription");
        await AsyncStorage.setItem("ProMembership", "true");
        setisProMember(true);
        return;
      }

      // Get fresh subscription status from RevenueCat
      const Purchases = require("react-native-purchases").default;
      const customerInfo = await Purchases.getCustomerInfo();

      const activeSubscriptions = customerInfo.activeSubscriptions || [];
      const freshIsProMember = activeSubscriptions.length > 0;

      // Update AsyncStorage with fresh data
      await AsyncStorage.setItem("ProMembership", freshIsProMember.toString());
      setisProMember(freshIsProMember);

      console.log("✅ Fresh subscription status:", freshIsProMember);
    } catch (error) {
      console.log("Error checking RevenueCat subscription:", error);
      // Fallback to cached value if RevenueCat check fails
      let MembershipCheck = await AsyncStorage.getItem("ProMembership");
      setisProMember(MembershipCheck === "true");
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
      clearInterval(intervalRef.current);
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
        // Message will be received via Socket.IO real-time
        // No need to append locally - socket will handle it
        setInputText(""); // Clear input
        setInputModalVisible(false); // Close modal
        console.log("✅ Message sent successfully, waiting for socket event");
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
    <SafeAreaView style={styles.safeAreaView} edges={["top", "left", "right"]}>
      <View style={styles.animatedView}>
        {openSubBottomScreen ? (
          <SubBottomScreen setopenSubBottomScreen={setopenSubBottomScreen} />
        ) : (
          <View style={{ flex: 1 }}>
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
                    onOpenInput={() => setInputModalVisible(true)}
                  />

                  {/* Chat Input Modal */}
                  <ChatInputModal
                    visible={inputModalVisible}
                    onClose={() => setInputModalVisible(false)}
                    inputText={inputText}
                    onChangeText={setInputText}
                    onSend={() => onSend(inputText)}
                    sending={loadingSendMessage}
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
          </View>
        )}
      </View>
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
