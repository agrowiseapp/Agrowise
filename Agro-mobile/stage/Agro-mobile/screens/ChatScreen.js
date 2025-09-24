import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import colors from "../assets/Theme/colors";
import ScreenTitle from "../components/structure/ScreenTitle";
import { Feather } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
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
      //clearTimeout(timeoutID);
      //console.log("Unsubscribed call to clear : ", intervalRef.current);
      clearInterval(intervalRef.current);
      console.log("UNSUBSCRIBE");
    });

    // return () => {
    //
    //   unsubscribe();
    // };

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

      //console.log("Chat Exists : ", chatExists);

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
      //Alert.alert(error);
      console.log("Error :", error);
    }
  };

  const MembershipCheckFunction = async () => {
    let MembershipCheck = await AsyncStorage.getItem("ProMembership");
    console.log("Chat Screen - Membership Check :", MembershipCheck);
    if (MembershipCheck == "true") {
      setisProMember(true);
    } else {
      setisProMember(false);
    }
  };

  const getChatInfo = async () => {
    let MembershipCheck = await AsyncStorage.getItem("ProMembership");
    console.log("Chat Screen - Membership Check :", MembershipCheck);
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
      let token = await AsyncStorage.getItem("token");

      const response = await UserInfoApi("apiUrl", token);
      const data = await response.json();
      //console.log("User Info: ", data);

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
        // Handle HTTP error status here
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      //console.log("MESSAGES :", data);

      if (data?.resultCode === 0) {
        const newMessages = data.response.messages;
        //console.log("new messages array :", newMessages);

        if (messages.length > 0) {
          //console.log("Messages.lenth>0");
          const lastMessage = messages[messages.length - 1];
          const newLastMessage = newMessages[newMessages.length - 1];
          if (lastMessage?.text !== newLastMessage?.text) {
            setMessages(newMessages);
            console.log("Chat Fetched Successfully");
          }
        } else {
          //console.log("Messages.lenth==0");

          setMessages(newMessages);
          //console.log("Chat Fetched Successfully");
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
      //setLoadingSendMessage(false);
      // await setloading(false);
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

      let fullName = "";
      fullName = parsedUserInfo.firstName + " " + parsedUserInfo.lastName;

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

      //console.log("Data response from message : ", data);

      if (data?.resultCode == 0) {
        // console.log("Message sent successfully..", data);

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
      // await setloading(false);
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

      let fullName = "";
      fullName = parsedUserInfo.firstName + " " + parsedUserInfo.lastName;

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
      // await setloading(false);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "height" : null}
      style={{ flex: 1 }}
    >
      <AnimatedView style={{ flex: 1 }}>
        {openSubBottomScreen ? (
          <SubBottomScreen setopenSubBottomScreen={setopenSubBottomScreen} />
        ) : (
          <SafeAreaView className="flex-1">
            <View className="flex-row justify-between items-center ">
              <ScreenTitle
                title="Επικοινωνία"
                back={true}
                navigation={navigation}
              />
            </View>

            <View className="flex-1">
              {loading ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
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
                // Chat not exist``
                <View className="flex-1  justify-center items-center px-3">
                  <Text className="text-2xl font-semibold">
                    Χρειάζεσαι συμβουλή ή έχεις κάποια απορρία;
                  </Text>
                  <Text className="text-base">
                    Επικοινωνήσε άμεσα με έναν σύμβουλο.
                  </Text>
                  <TouchableOpacity
                    className="mt-5 py-3 px-5 bg-gray-400 rounded-full shadow"
                    onPress={createChatOropenSub}
                  >
                    <Text className="text-base font-semibold text-white">
                      Αποστολή μηνύματος.
                    </Text>
                  </TouchableOpacity>

                  {/* Website`` */}
                  <View className="flex-row items-center mt-10">
                    <Feather
                      name="globe"
                      size={24}
                      style={{ color: colors.Main[500], marginRight: 5 }}
                    />
                    <Text className="text-gray-500 text-base ">
                      www.infoagro.gr
                    </Text>
                  </View>

                  {/* Phone */}
                  <View className="flex-row items-center mt-4">
                    <FontAwesome
                      name="phone"
                      size={24}
                      style={{ color: colors.Main[500] }}
                    />
                    <Text className="text-gray-500 text-base">
                      +30 6989593525
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </SafeAreaView>
        )}
      </AnimatedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputToolbarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    marginBottom: 0,
    paddingHorizontal: 5,
    textAlignVertical: "center",
  },
  inputToolbarPrimary: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#fff",
  },
});

export default ChatScreen;
