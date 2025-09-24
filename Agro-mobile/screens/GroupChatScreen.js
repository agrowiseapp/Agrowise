import {
  Text,
  View,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
  Modal,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import SimpleIcons from "../components/icons/SimpleIcons";
import AsyncStorage from "../utils/AsyncStorage";
import colors from "../assets/Theme/colors";
import * as Animatable from "react-native-animatable";
import useRevenueCat from "../hooks/useRevenueCat";
import {
  getRecentGroupMessagesApi,
  sendGroupMessageApi,
  deleteGroupMessageApi,
  reportGroupMessageApi,
} from "../apis/GroupChatApi";

const GroupChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const { isProMember } = useRevenueCat();
  const navigation = useNavigation();

  useEffect(() => {
    initializeChat();
  }, []);

  // Re-initialize when isProMember status changes
  useEffect(() => {
    if (isProMember !== undefined) {
      console.log("🔄 GroupChat - isProMember changed, re-initializing...");
      initializeChat();
    }
  }, [isProMember]);

  // Auto-refresh messages every 30 seconds with navigation listeners
  useEffect(() => {
    let interval;

    const startInterval = () => {
      if (!isDemoUser && !initializing && currentUser && !interval) {
        console.log("🔄 GroupChat - Starting auto-refresh interval");
        interval = setInterval(() => {
          console.log("🔄 GroupChat - Auto-refreshing messages...");
          fetchMessages();
        }, 30000); // 30 seconds
      }
    };

    const stopInterval = () => {
      if (interval) {
        console.log("🛑 GroupChat - Clearing auto-refresh interval");
        clearInterval(interval);
        interval = null;
      }
    };

    // Start interval immediately if conditions are met
    startInterval();

    // Add navigation listeners
    const focusUnsubscribe = navigation.addListener("focus", () => {
      console.log("🔄 GroupChat - Screen focused, starting interval");
      startInterval();
    });

    const blurUnsubscribe = navigation.addListener("blur", () => {
      console.log("🛑 GroupChat - Screen blurred, stopping interval");
      stopInterval();
    });

    return () => {
      stopInterval();
      focusUnsubscribe();
      blurUnsubscribe();
    };
  }, [isDemoUser, initializing, currentUser, navigation]);

  const initializeChat = async () => {
    console.log("🚀 GroupChat - Starting initializeChat");
    setInitializing(true);

    // Check if user is in demo mode (no token means demo user)
    const userToken = await AsyncStorage.getItem("userToken");
    console.log("🔍 GroupChat - userToken exists:", !!userToken);
    console.log("🔍 GroupChat - isProMember:", isProMember);

    // If isProMember is still undefined, wait for RevenueCat to load
    if (isProMember === undefined) {
      console.log("⏳ GroupChat - Waiting for RevenueCat to load...");
      // Keep initializing true to show loading spinner while waiting
      setInitializing(true);
      setIsDemoUser(false); // Reset demo user state while waiting
      return;
    }

    const demoMode = !userToken || !isProMember;
    console.log("🔍 GroupChat - demoMode:", demoMode);
    setIsDemoUser(demoMode);

    if (demoMode) {
      // For demo users, show restriction message instead of loading chat
      console.log("🚫 GroupChat - In demo mode, stopping initialization");
      setInitializing(false);
      return;
    }

    console.log("📋 GroupChat - Getting user info...");
    const userInfo = await getUserInfo();
    console.log(
      "📋 GroupChat - User info result:",
      userInfo ? "SUCCESS" : "FAILED"
    );

    console.log("📨 GroupChat - Fetching messages...");
    await fetchMessages(userInfo);
    console.log("✅ GroupChat - fetchMessages completed");

    // Check if user has seen the tooltip before
    const tooltipSeen = await AsyncStorage.getItem("groupChatTooltipSeen");

    setTimeout(() => {
      if (!tooltipSeen) {
        setShowTooltip(true);
      }
      setInitializing(false);
    }, 1000);
  };

  const getUserInfo = async () => {
    try {
      console.log("👤 GroupChat - Getting userInfo from AsyncStorage...");
      let userInfo = await AsyncStorage.getItem("userInfo");
      console.log("👤 GroupChat - Raw userInfo:", userInfo ? "EXISTS" : "NULL");

      if (!userInfo) {
        console.log("❌ GroupChat - No userInfo found in AsyncStorage");
        return null;
      }

      let parsedUserInfo = await JSON.parse(userInfo);
      console.log("👤 GroupChat - Parsed userInfo:", {
        userId: parsedUserInfo?.userId,
        firstName: parsedUserInfo?.firstName,
        email: parsedUserInfo?.email,
      });

      setCurrentUser(parsedUserInfo);
      console.log(
        "✅ GroupChat - Current user loaded:",
        parsedUserInfo?.firstName
      );
      return parsedUserInfo;
    } catch (error) {
      console.log("❌ GroupChat - Error getting user info:", error);
      Alert.alert("Σφάλμα", "Δεν μπόρεσε να φορτωθούν τα στοιχεία χρήστη");
      return null;
    }
  };

  const fetchMessages = async (userInfo = null) => {
    try {
      console.log("📨 GroupChat - Starting fetchMessages");
      setLoading(true);
      let userToken = await AsyncStorage.getItem("userToken");
      console.log("🔑 GroupChat - userToken exists:", !!userToken);

      if (!userToken) {
        console.log("❌ GroupChat - No user token found");
        setLoading(false);
        return;
      }

      const currentUserInfo = userInfo || currentUser;
      console.log(
        "👤 GroupChat - Using userInfo:",
        currentUserInfo ? "PROVIDED" : "FROM_STATE"
      );
      console.log("👤 GroupChat - Current user ID:", currentUserInfo?.userId);

      console.log("🌐 GroupChat - Calling getRecentGroupMessagesApi...");
      const response = await getRecentGroupMessagesApi(
        "apiUrl",
        userToken,
        150
      );
      console.log("🌐 GroupChat - API response status:", response.status);

      const data = await response.json();
      console.log("📊 GroupChat - Response data:", {
        resultCode: data.resultCode,
        hasMessages: !!data.response?.messages,
        messageCount: data.response?.messages?.length || 0,
      });

      if (data.resultCode === 0 && data.response?.messages) {
        console.log("✅ GroupChat - Messages received successfully");
        // Transform backend data to match frontend format
        console.log(
          "👤 GroupChat - Processing messages for user ID:",
          currentUserInfo?.userId
        );
        const transformedMessages = data.response.messages.map((msg) => {
          // Handle ObjectId comparison - convert both to strings and compare
          const messageUserId =
            typeof msg.userId === "object" && msg.userId !== null
              ? msg.userId._id ||
                msg.userId.toString() ||
                JSON.stringify(msg.userId).replace(/"/g, "")
              : String(msg.userId);
          const currentUserId = String(currentUserInfo?.userId);
          const isCurrentUser = messageUserId === currentUserId;
          console.log(
            `Message from ${msg.authorName}, userId: ${messageUserId}, currentUserId: ${currentUserId}, isCurrentUser: ${isCurrentUser}`
          );
          return {
            id: msg._id,
            text: msg.message,
            username: msg.authorName,
            date: msg.date,
            userId: msg.userId,
            isCurrentUser: isCurrentUser,
            isReported: msg.isReported || false, // Add reported status
          };
        });

        // Sort messages by date (oldest first for chat display)
        transformedMessages.sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log("📝 GroupChat - Setting messages in state...");
        setMessages(transformedMessages);
        console.log(
          "✅ GroupChat - Loaded",
          transformedMessages.length,
          "messages"
        );

        // Scroll to bottom after loading
        setTimeout(() => scrollToBottom(), 100);
      } else {
        console.log(
          "❌ GroupChat - No messages found or API error:",
          data.message
        );
        setMessages([]);
      }
    } catch (error) {
      console.log("❌ GroupChat - Error fetching messages:", error);
      Alert.alert("Σφάλμα", "Δεν μπόρεσαν να φορτωθούν τα μηνύματα");
    } finally {
      console.log("🏁 GroupChat - fetchMessages finally block");
      setLoading(false);
      setInitializing(false);
    }
  };

  const sendMessage = async () => {
    console.log("Current user state:", currentUser);
    if (inputText.trim() === "") return;
    if (sending) return; // Prevent double sending

    try {
      setSending(true);
      let userToken = await AsyncStorage.getItem("userToken");

      // Get fresh user info if currentUser is not set
      let userInfo = currentUser;
      if (!userInfo) {
        console.log("Getting fresh user info for sending...");
        let storedUserInfo = await AsyncStorage.getItem("userInfo");
        userInfo = JSON.parse(storedUserInfo);
        setCurrentUser(userInfo);
      }

      if (!userToken || !userInfo) {
        Alert.alert("Σφάλμα", "Δεν βρέθηκαν στοιχεία χρήστη");
        return;
      }

      const messageBody = {
        message: inputText.trim(),
        authorName: `${userInfo.firstName} ${userInfo.lastName}`,
        userId: userInfo.userId,
      };

      console.log("Sending message:", messageBody);

      const response = await sendGroupMessageApi(
        "apiUrl",
        messageBody,
        userToken
      );
      const data = await response.json();

      console.log("Send message response:", data);

      if (data.resultCode === 0) {
        // Add the new message to local state immediately for better UX
        const newMessage = {
          id: data.response.id || Date.now().toString(),
          text: data.response.message || inputText.trim(),
          username:
            data.response.authorName ||
            `${userInfo.firstName} ${userInfo.lastName}`,
          date: data.response.date || new Date().toISOString(),
          userId: data.response.userId || userInfo.userId,
          isCurrentUser: true,
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInputText("");

        // Scroll to bottom after sending
        setTimeout(() => scrollToBottom(), 100);

        console.log("Message sent successfully");
      } else {
        Alert.alert("Σφάλμα", data.message || "Το μήνυμα δεν στάλθηκε");
      }
    } catch (error) {
      console.log("Error sending message:", error);
      Alert.alert("Σφάλμα", "Δεν μπόρεσε να σταλεί το μήνυμα");
    } finally {
      setSending(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMessages(currentUser);
    setRefreshing(false);
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("el-GR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLongPress = (message) => {
    // Only allow reporting other users' messages that haven't been reported yet
    if (!message.isCurrentUser && !message.isReported) {
      setSelectedMessage(message);
      setReportModalVisible(true);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert("Σφάλμα", "Παρακαλώ επιλέξτε λόγο αναφοράς");
      return;
    }

    try {
      setSubmittingReport(true);
      const userToken = await AsyncStorage.getItem("userToken");
      const currentUserInfo = await AsyncStorage.getItem("userInfo");
      const parsedUserInfo = JSON.parse(currentUserInfo);

      const reportData = {
        messageId: selectedMessage.id,
        reportedUserId: selectedMessage.userId,
        reportedUsername: selectedMessage.username,
        reason: reportReason,
        reportedText: selectedMessage.text,
        reporterUserId: parsedUserInfo.userId,
        reporterUsername: `${parsedUserInfo.firstName} ${parsedUserInfo.lastName}`,
      };

      console.log("Reporting message:", reportData);

      const response = await reportGroupMessageApi(
        "apiUrl",
        reportData,
        userToken
      );
      const data = await response.json();

      if (data.resultCode === 0) {
        // Mark message as reported locally
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === selectedMessage.id ? { ...msg, isReported: true } : msg
          )
        );

        Alert.alert(
          "Αναφορά εστάλη",
          "Η αναφορά σας έχει σταλεί για επεξεργασία. Ευχαριστούμε που βοηθάτε να διατηρήσουμε την κοινότητα ασφαλή.",
          [{ text: "OK", onPress: closeReportModal }]
        );
      } else {
        Alert.alert(
          "Σφάλμα",
          data.message || "Δεν μπόρεσε να σταλεί η αναφορά."
        );
      }
    } catch (error) {
      console.log("Error reporting message:", error);
      Alert.alert(
        "Σφάλμα",
        "Δεν μπόρεσε να σταλεί η αναφορά. Προσπαθήστε ξανά."
      );
    } finally {
      setSubmittingReport(false);
    }
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
    setSelectedMessage(null);
    setReportReason("");
  };

  const reportReasons = [
    "Ανάρμοστο περιεχόμενο",
    "Παρενόχληση ή εκφοβισμός",
    "Spam ή ανεπιθύμητα μηνύματα",
    "Ψευδείς πληροφορίες",
    "Προσβλητική γλώσσα",
    "Άλλο",
  ];

  const dismissTooltip = () => {
    setShowTooltip(false);
    // Optional: Store in AsyncStorage to not show again
    AsyncStorage.setItem("groupChatTooltipSeen", "true");
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        {
          flexDirection: "row",
          marginVertical: 4,
          paddingHorizontal: 16,
        },
        item.isCurrentUser
          ? { justifyContent: "flex-end" }
          : { justifyContent: "flex-start" },
      ]}
    >
      {/* Red flag for reported messages - positioned outside message bubble */}
      {item.isReported && !item.isCurrentUser && (
        <View
          style={{
            marginRight: 6,
            marginTop: 14, // Align with message content
          }}
        >
          <SimpleIcons name="flag" size={16} color="#dc2626" />
        </View>
      )}

      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
        activeOpacity={item.isReported ? 1 : 0.7}
        style={{
          maxWidth: item.isReported && !item.isCurrentUser ? "72%" : "80%", // Adjust for flag space
          minWidth: "40%", // Ensure minimum width for proper text layout
          padding: 12,
          borderRadius: 18,
          backgroundColor: item.isCurrentUser
            ? colors.Main[500]
            : colors.Background.secondary,
          opacity: item.isReported && !item.isCurrentUser ? 0.8 : 1,
        }}
      >
        {!item.isCurrentUser && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.Main[600],
                flex: 1,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.username}
            </Text>
            {item.isReported && (
              <Text
                style={{
                  fontSize: 10,
                  color: "#dc2626",
                  fontWeight: "500",
                }}
              >
                Αναφέρθηκε
              </Text>
            )}
          </View>
        )}
        <Text
          style={{
            fontSize: 16,
            color: item.isCurrentUser ? "white" : colors.Text.primary,
            lineHeight: 20,
            fontStyle: item.isReported && !item.isCurrentUser ? "italic" : "normal",
          }}
        >
          {item.isReported && !item.isCurrentUser ? "Προσωρινά μη διαθέσιμο" : item.text}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: item.isCurrentUser
              ? "rgba(255,255,255,0.8)"
              : colors.Text.secondary,
            marginTop: 4,
            textAlign: "right",
          }}
        >
          {formatTime(item.date)}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Demo user restriction screen - show this before loading screen
  if (isDemoUser) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.Background.primary }}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.Background.primary}
        />

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.Border?.light || "#e5e5e5",
            backgroundColor: "white",
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#fbbf24", // Yellow for demo
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.Text?.primary || "#000",
              flex: 1,
            }}
          >
            Ομαδικό Chat
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.Text?.secondary || "#666",
            }}
          >
            Δοκιμαστικό
          </Text>
        </View>

        {/* Demo Restriction Content */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 24,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <SimpleIcons
              name="chat"
              size={64}
              color={colors.Main?.[500] || "#628479"}
              style={{ marginBottom: 16 }}
            />

            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: colors.Text?.primary || "#000",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Ομαδικό Chat
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: colors.Text?.secondary || "#666",
                textAlign: "center",
                lineHeight: 24,
                marginBottom: 24,
              }}
            >
              Το ομαδικό chat είναι διαθέσιμο μόνο για συνδρομητές. Κάντε
              εγγραφή για να συμμετέχετε στις συζητήσεις με άλλους χρήστες!
            </Text>

            <View
              style={{
                flexDirection: "row",
                gap: 12,
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.Main?.[500] || "#628479",
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={() => {
                  navigation.navigate("Subscription");
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Εγγραφή
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 12,
                color: colors.Text?.secondary || "#666",
                textAlign: "center",
                marginTop: 16,
                fontStyle: "italic",
              }}
            >
              Συνεχίστε να εξερευνάτε τις άλλες λειτουργίες της εφαρμογής σε
              δοκιμαστική λειτουργία
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Loading screen - show after demo user check
  if (loading || initializing) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.Background.primary }}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.Background.primary}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.Border.light,
            backgroundColor: "white",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.Text.primary,
              flex: 1,
              textAlign: "center",
            }}
          >
            Ομαδικό Chat
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={colors.Main[500]} />
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              color: colors.Text.secondary,
            }}
          >
            Φόρτωση μηνυμάτων...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.Background.primary }}
        edges={["top", "left", "right"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.Background.primary}
        />

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.Border.light,
            backgroundColor: "white",
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.Success.primary,
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.Text.primary,
              flex: 1,
            }}
          >
            Ομαδικό Chat
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.Text.secondary,
            }}
          >
            {messages.length >= 100
              ? "100+ μηνύματα"
              : `${messages.length} μηνύματα`}
          </Text>
        </View>

        {/* Tooltip */}
        {showTooltip && (
          <Animatable.View
            animation="slideInDown"
            duration={600}
            easing="ease-out"
            style={{
              backgroundColor: colors.Main[600],
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: colors.Border?.light || "#e5e5e5",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "white",
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                💬 Καλώς ήρθατε στο Ομαδικό Chat!
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 12,
                  lineHeight: 16,
                }}
              >
                Κρατήστε πατημένο οποιοδήποτε μήνυμα για να το αναφέρετε.
                Μοιραστείτε ιδέες και συζητήστε με άλλους χρήστες!
              </Text>
            </View>
            <TouchableOpacity
              onPress={dismissTooltip}
              style={{
                padding: 8,
                marginLeft: 8,
                borderRadius: 20,
              }}
              activeOpacity={0.7}
            >
              <SimpleIcons
                name="close"
                size={20}
                color="rgba(255,255,255,0.9)"
              />
            </TouchableOpacity>
          </Animatable.View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 8 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.Main[500]}
            />
          }
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollToBottom()}
          onLayout={() => scrollToBottom()}
        />

        {/* Input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 0,
            borderTopWidth: 1,
            borderTopColor: colors.Border.light,
            backgroundColor: "white",
          }}
        >
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: colors.Border.light,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 16,
              maxHeight: 100,
              marginRight: 8,
              marginBottom: 10,
              backgroundColor: colors.Background.primary,
            }}
            placeholder="Γράψτε ένα μήνυμα..."
            placeholderTextColor={colors.Text.secondary}
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
            textAlignVertical="center"
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={inputText.trim() === "" || sending}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor:
                inputText.trim() !== "" && !sending
                  ? colors.Main[500]
                  : colors.Border.light,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <SimpleIcons
                name="send"
                size={20}
                color={
                  inputText.trim() !== "" ? "white" : colors.Text.secondary
                }
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Report Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={reportModalVisible}
          onRequestClose={closeReportModal}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 24,
                width: "90%",
                maxHeight: "80%",
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <SimpleIcons
                  name="report"
                  size={24}
                  color={colors.Error?.primary || "#dc2626"}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: colors.Text?.primary || "#000",
                    marginLeft: 8,
                    flex: 1,
                  }}
                >
                  Αναφορά μηνύματος
                </Text>
                <TouchableOpacity onPress={closeReportModal}>
                  <SimpleIcons
                    name="close"
                    size={24}
                    color={colors.Text?.secondary || "#666"}
                  />
                </TouchableOpacity>
              </View>

              {/* Message Preview */}
              {selectedMessage && (
                <View
                  style={{
                    backgroundColor: colors.Background?.secondary || "#f5f5f5",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: colors.Text?.secondary || "#666",
                      marginBottom: 4,
                    }}
                  >
                    Μήνυμα από: {selectedMessage.username}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.Text?.primary || "#000",
                    }}
                  >
                    "{selectedMessage.text}"
                  </Text>
                </View>
              )}

              {/* Report Reasons */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.Text?.primary || "#000",
                  marginBottom: 12,
                }}
              >
                Λόγος αναφοράς:
              </Text>

              <View style={{ marginBottom: 20 }}>
                {reportReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    onPress={() => setReportReason(reason)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 8,
                      paddingHorizontal: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor:
                          reportReason === reason
                            ? colors.Main?.[500] || "#628479"
                            : colors.Border?.light || "#ccc",
                        backgroundColor:
                          reportReason === reason
                            ? colors.Main?.[500] || "#628479"
                            : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      {reportReason === reason && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "white",
                          }}
                        />
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.Text?.primary || "#000",
                      }}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                }}
              >
                <TouchableOpacity
                  onPress={closeReportModal}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.Border?.light || "#ccc",
                    backgroundColor: "transparent",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "600",
                      color: colors.Text?.secondary || "#666",
                    }}
                  >
                    Ακύρωση
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleReport}
                  disabled={!reportReason.trim() || submittingReport}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor:
                      reportReason.trim() && !submittingReport
                        ? colors.Error?.primary || "#dc2626"
                        : colors.Border?.light || "#ccc",
                  }}
                >
                  {submittingReport ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 16,
                        fontWeight: "600",
                        color: "white",
                      }}
                    >
                      Αναφορά
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Disclaimer */}
              <Text
                style={{
                  fontSize: 12,
                  color: colors.Text?.secondary || "#666",
                  textAlign: "center",
                  marginTop: 16,
                  lineHeight: 16,
                }}
              >
                Οι αναφορές εξετάζονται από την ομάδα μας. Η κατάχρηση του
                συστήματος αναφοράς μπορεί να οδηγήσει σε περιορισμούς του
                λογαριασμού σας.
              </Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default GroupChatScreen;
