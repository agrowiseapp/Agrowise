import {
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createAnimatableComponent,
  View as AnimatableView,
  Text as AnimatableText,
} from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import SimpleIcons from "../components/icons/SimpleIcons";
import AsyncStorage from "../utils/AsyncStorage";
import colors from "../assets/Theme/colors";

const AnimatedView = createAnimatableComponent(AnimatableView);
const AnimatedText = createAnimatableComponent(AnimatableText);

const HomeScreen2 = ({ route }) => {
  // State
  const animatedViewRef = useRef(null);
  const animatedTextsRef1 = useRef(null);
  const animatedTextsRef2 = useRef(null);
  const navigation = useNavigation();
  const [user, setuser] = useState(null);
  const [isProMember, setisProMember] = useState(false);

  // Effects
  useEffect(() => {
    animateOnFocus();
    const unsubscribe = navigation.addListener("focus", animateOnFocus);
    MembershipCheckFunction();
    getUserInfoFunction();

    return unsubscribe;
  }, [navigation]);

  // Functions
  const animateOnFocus = () => {
    if (animatedViewRef.current) {
      animatedViewRef.current.animate("fadeIn", 800);
    }
    if (animatedTextsRef1.current) {
      animatedTextsRef1.current.animate("slideInLeft", 600);
    }
    if (animatedTextsRef2.current) {
      animatedTextsRef2.current.animate("slideInLeft", 800);
    }
  };

  const getUserInfoFunction = async () => {
    try {
      let userInfo = await AsyncStorage.getItem("userInfo");
      let parsedUserInfo = await JSON.parse(userInfo);
      setuser(parsedUserInfo);
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

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.Main[600]} />
      <View style={{ flex: 1, backgroundColor: colors.Background.primary }}>
        {/* Hero Section */}
        <View
          style={{
            backgroundColor: colors.Main[600],
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            shadowColor: colors.Shadow.md,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 8,
            paddingTop: 15,
            paddingBottom: 32,
          }}
        >
          <SafeAreaView>
            {/* Header with User Info */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 24,
              paddingBottom: 15,
            }}
          >
            <View>
              <Text
                style={{
                  color: colors.Text.inverse,
                  fontSize: 20,
                }}
              >
                Καλησπέρα,
              </Text>
              <Text
                style={{
                  color: colors.Text.inverse,
                  fontSize: 24,
                }}
              >
                {!isProMember ? "Επισκέπτη" : user?.firstName || "Χρήστη"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.Surface.primary,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: colors.Shadow.md,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <SimpleIcons name="person" size={24} color={colors.Main[600]} />
            </TouchableOpacity>
          </View>

          {/* Welcome Text */}
          <View
            style={{
              paddingHorizontal: 24,
            }}
          >
            <AnimatedText
              ref={animatedTextsRef1}
              style={{
                color: colors.Text.inverse,
                fontSize: 24,
                fontWeight: "300",
              }}
            >
              Καλωσήρθες στο{" "}
              <Text
                style={{
                  color: colors.Second[400],
                  fontWeight: "bold",
                }}
              >
                AgroWise
              </Text>
            </AnimatedText>

            <AnimatedText
              ref={animatedTextsRef2}
              style={{
                color: colors.Text.inverse,
                fontSize: 30,
                fontWeight: "300",
              }}
            >
              Ας ξεκινήσουμε!
            </AnimatedText>
          </View>
          </SafeAreaView>
        </View>

        {/* Content Section */}
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 25,
          }}
        >
          {/* Action Cards */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* News Card */}
            <TouchableOpacity
              onPress={() => navigation.navigate("News")}
              style={{
                backgroundColor: colors.Surface.primary,
                borderRadius: 16,
                padding: 15,
                marginBottom: 16,
                shadowColor: colors.Shadow.md,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: 1,
                borderColor: colors.Border.light,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 16,
                    backgroundColor: colors.Main[100],
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <SimpleIcons
                    name="newspaper"
                    size={24}
                    color={colors.Main[600]}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: colors.Text.primary,
                      marginBottom: 5,
                    }}
                  >
                    ΕΝΗΜΕΡΩΣΗ
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.Text.secondary,
                      lineHeight: 18,
                    }}
                  >
                    Μείνε ενημερωμένος στα τελευταία νέα και εξελίξεις.
                  </Text>
                </View>

                <SimpleIcons
                  name="chevron-right"
                  size={24}
                  color={colors.Text.tertiary}
                />
              </View>
            </TouchableOpacity>

            {/* Chat Card */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Chat")}
              style={{
                backgroundColor: colors.Surface.primary,
                borderRadius: 16,
                padding: 15,
                marginBottom: 16,
                shadowColor: colors.Shadow.md,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: 1,
                borderColor: colors.Border.light,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 16,
                    backgroundColor: colors.Second[100],
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <SimpleIcons
                    name="message"
                    size={24}
                    color={colors.Second[600]}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: colors.Text.primary,
                      marginBottom: 5,
                    }}
                  >
                    ΣΥΜΒΟΥΛΕΥΤΙΚΗ
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.Text.secondary,
                      lineHeight: 18,
                    }}
                  >
                    Λάβετε συμβουλές για οτιδήποτε σας απασχολεί.
                  </Text>
                </View>

                <SimpleIcons
                  name="chevron-right"
                  size={24}
                  color={colors.Text.tertiary}
                />
              </View>
            </TouchableOpacity>

            {/* Group Chat Card */}
            <TouchableOpacity
              onPress={() => navigation.navigate("GroupChat")}
              style={{
                backgroundColor: colors.Surface.primary,
                borderRadius: 16,
                padding: 15,
                marginBottom: 16,
                shadowColor: colors.Shadow.md,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: 1,
                borderColor: colors.Border.light,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 16,
                    backgroundColor: colors.Main[100],
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <SimpleIcons
                    name="people"
                    size={24}
                    color={colors.Main[600]}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: colors.Text.primary,
                      marginBottom: 5,
                    }}
                  >
                    ΟΜΑΔΙΚΟ CHAT
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.Text.secondary,
                      lineHeight: 18,
                    }}
                  >
                    Συμμετάσχετε στη συζήτηση με άλλους χρήστες.
                  </Text>
                </View>

                <SimpleIcons
                  name="chevron-right"
                  size={24}
                  color={colors.Text.tertiary}
                />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Footer */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.Surface.primary,
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderTopWidth: 1,
            borderTopColor: colors.Border.light,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <SimpleIcons
                name="globe"
                size={16}
                color={colors.Text.tertiary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  color: colors.Text.tertiary,
                  fontSize: 14,
                }}
              >
                www.infoagro.gr
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <SimpleIcons
                name="phone"
                size={16}
                color={colors.Text.tertiary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  color: colors.Text.tertiary,
                  fontSize: 14,
                }}
              >
                +30 6989593525
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default HomeScreen2;
