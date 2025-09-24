import {
  SafeAreaView,
  Text,
  Button,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  Image,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ScreenTitle from "../components/structure/ScreenTitle";
import { useNavigation } from "@react-navigation/native";
import {
  createAnimatableComponent,
  View as AnimatableView,
} from "react-native-animatable";
import colors from "../assets/Theme/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Avatar } from "@rneui/themed";
import Avatar1 from "../assets/images/avatar1.png";
import Avatar2 from "../assets/images/avatar2.png";
import Avatar3 from "../assets/images/avatar3.png";
import Avatar4 from "../assets/images/avatar4.png";
import Avatar5 from "../assets/images/avatar5.png";
import Avatar6 from "../assets/images/avatar6.png";
import Avatar7 from "../assets/images/avatar7.png";
import Avatar8 from "../assets/images/avatar8.png";
import { BottomSheet } from "@rneui/themed";
import { deleteUserApi, editUserApi } from "../apis/LoginApi";
import SubBottomScreen from "../components/subscriptions/SubBottomScreen";
import useRevenueCat from "../hooks/useRevenueCat";

const AnimatedView = createAnimatableComponent(AnimatableView);

const avatars = {
  1: Avatar1,
  2: Avatar2,
  3: Avatar3,
  4: Avatar4,
  5: Avatar5,
  6: Avatar6,
  7: Avatar7,
  8: Avatar8,
};

const ProfileScreen = ({}) => {
  // 1) Data

  const animatedViewRef = useRef(null);
  const navigation = useNavigation();
  const [user, setuser] = useState(null);
  const [commentsNotification, setcommentsNotification] = useState(0);
  const [chatNotification, setchatNotification] = useState(0);
  const [sheet1isVisible, setsheet1IsVisible] = useState(false);
  const [sheet2isVisible, setsheet2IsVisible] = useState(false);
  const [accountError, setaccountError] = useState(false);
  const [isProMember, setisProMember] = useState(false);
  const [openSubBottomScreen, setopenSubBottomScreen] = useState(false);

  // 2) UseEffects
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      //console.log("FOCUSED");
      if (animatedViewRef.current) {
        animatedViewRef.current.animate("fadeIn", 300);
      }

      getNotificationsFunction();
      getUserInfoFunction();
      MembershipCheckFunction();
    });

    return unsubscribe;
  }, [navigation]);

  // 3) Functions

  const getUserInfoFunction = async () => {
    try {
      let userInfo = await AsyncStorage.getItem("userInfo");
      let parsedUserInfo = await JSON.parse(userInfo);
      setuser(parsedUserInfo);
    } catch (error) {
      console.log("Error :", error);
    }
  };

  const getNotificationsFunction = async () => {
    let commentsNotifications = await AsyncStorage.getItem(
      "commentsNotifications"
    );

    let chatNotifications = await AsyncStorage.getItem("chatNotifications");

    setcommentsNotification(commentsNotifications);
    setchatNotification(chatNotifications);
  };

  const navigateFunction = (index) => {
    if (index === 0) {
      AsyncStorage.setItem("initialFilter", "2");
      navigation.navigate("News");
    } else {
      navigation.navigate("Chat");
    }
  };

  const handleFirstNameChange = (text) => {
    setuser((prevUser) => ({
      ...prevUser,
      firstName: text,
    }));
  };

  const handleLastNameChange = (text) => {
    setuser((prevUser) => ({
      ...prevUser,
      lastName: text,
    }));
  };

  const handleEmailChange = (text) => {
    setuser((prevUser) => ({
      ...prevUser,
      email: text,
    }));
  };

  const handlePasswordChange = (text) => {
    setuser((prevUser) => ({
      ...prevUser,
      password: text,
    }));
  };

  const handlePhoneChange = (text) => {
    setuser((prevUser) => ({
      ...prevUser,
      phone: text,
    }));
  };

  const handleEditAccount = async () => {
    let check = await validateForm();

    if (check) {
      EditAccount();
      setaccountError(null);
    } else {
      setaccountError(
        "*Παρακαλώ συμπληρώστε όλα τα πεδία και βεβαιωθείτε ότι είναι σωστά πριν προχωτήσετε!"
      );
    }
  };

  const EditAccount = async () => {
    try {
      let bodyObject = {
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      };

      let userToken = await AsyncStorage.getItem("userToken");

      const response = await editUserApi("apiUrl", bodyObject, userToken);
      const data = await response.json();

      // console.log("Data: ", data);

      if (data.resultCode === 0) {
        LogoutUser();
      } else {
        setaccountError("*" + data.message);
      }
    } catch (error) {
      console.log("Error :", error);
    }
  };

  const LogoutUser = (async = () => {
    AsyncStorage.removeItem("userToken");
    navigation.navigate("Login");
  });

  const getAvatarSource = (avatarId) => {
    return avatars[avatarId] || avatars[1];
  };

  //sets and validates
  const validateForm = async () => {
    let oneError = await validateFirstName();
    let twoError = await validateLastName();
    let threeError = await validateEmail();
    let fourError = await validatePassword();
    let fiveError = await validatePhone();

    // console.log("oneError", oneError);
    // console.log("threeError", twoError);
    // console.log("twoError", threeError);
    // console.log("fourError", fourError);
    // console.log("fiveError", fiveError);

    let result = [
      !oneError,
      !twoError,
      !threeError,
      !fourError,
      !fiveError,
    ].every(Boolean);
    return result;
  };

  const validateFirstName = async () => {
    if (
      user.firstName == null ||
      user.firstName == "" ||
      user.firstName?.length < 4
    ) {
      return true;
    } else {
      return false;
    }
  };

  const validateLastName = async () => {
    if (
      user.lastName == null ||
      user.lastName == "" ||
      user.lastName?.length < 4
    ) {
      return true;
    } else {
      return false;
    }
  };

  const validateEmail = async () => {
    if (user.email == null || user.email == "" || user.email?.length < 4) {
      return true;
    } else {
      let reg = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (reg.test(user.email)) {
        return false;
      } else {
        return true;
      }
    }
  };

  const validatePassword = async () => {
    if (
      user.password == null ||
      user.password == "" ||
      user.password?.length < 6
    ) {
      return true;
    } else {
      return false;
    }
  };

  const validatePhone = async () => {
    if (user.phone == null || user.phone == "" || user.phone?.length < 10) {
      return true;
    } else {
      return false;
    }
  };

  const DeleteAccount = async () => {
    try {
      let userToken = await AsyncStorage.getItem("userToken");
      const response = await deleteUserApi("apiUrl", userToken);
      const data = await response.json();

      if (data?.resultCode === 0) {
        LogoutUser();
      }
    } catch (error) {
      console.log("Error on deleting : ", error);
    }
  };

  const cancelSubscription = async () => {
    Alert.alert(
      "Ακύρωση συνδρομής",
      "Θα μεταβείτε στις ρυθμίσεις και θα μπορέσετε από εκεί να διαχειριστείτε τις συνδρομές σας. Η διαδικασία υπάρχει στους όρους χρήσης, αν χρειάζεστε βοήθεια παρακαλώ πηγαίνεται στον παρακάτω σύνδεσμο : https://agrowise-admin.onrender.com/#/cancelsubscription",
      [
        {
          text: "Πίσω",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "Συνέχεια", onPress: () => openSubscriptionSettings() },
      ]
    );
  };

  const openSubscriptionSettings = async () => {
    // Check if the Linking module is supported
    const isSupported = await Linking.canOpenURL("app-settings:");

    if (Platform.OS == "android") {
      Linking.openSettings();
      return;
    }

    if (isSupported) {
      // Open the settings app to the subscriptions tab
      Linking.openURL("app-settings:");
    } else {
      console.error("Opening settings is not supported on this device.");
    }
  };

  const MembershipCheckFunction = async () => {
    let MembershipCheck = await AsyncStorage.getItem("ProMembership");
    console.log("Profile Screen - Membership Check :", MembershipCheck);
    if (MembershipCheck == "true") {
      setisProMember(true);
    } else {
      setisProMember(false);
    }
  };

  return (
    <AnimatedView ref={animatedViewRef} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 flex-col w-full  pb-10">
        {/* Header */}
        <View className="flex-row justify-between items-center ">
          <ScreenTitle title="Προφίλ" back={true} navigation={navigation} />
        </View>
        <ScrollView className="flex-1">
          {/* Profile */}

          <View className="px-3 mt-5">
            {!isProMember ? (
              <>
                {/* Profile image and Info */}
                <View className="flex-row justify-center ">
                  <View className="h-24 w-24 bg-white rounded-full justify-center items-center shadow-sm">
                    <Image
                      source={getAvatarSource(user?.avatar)}
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: 20,
                        backgroundColor: "#fff",
                      }}
                    />
                  </View>
                </View>

                {/* Name */}
                <View className="mt-3 mb-3">
                  <Text className="text-base text-center font-semibold">
                    Έχετε συνδεθεί ως επισκέπτης
                  </Text>
                </View>
              </>
            ) : (
              <>
                {/* Profile image and Info */}
                <View className="flex-row justify-center ">
                  <View className="h-24 w-24 bg-white rounded-full justify-center items-center shadow-sm">
                    {user !== null && (
                      <Image
                        source={getAvatarSource(user?.avatar)}
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 20,
                          backgroundColor: "#fff",
                        }}
                      />
                    )}
                  </View>
                </View>

                {/* Name */}
                <View className="mt-3 mb-3">
                  <Text className="text-xl text-center">
                    {user != null && user.firstName + " " + user.lastName}
                  </Text>
                  <Text className="text-base font-light text-center -mt-1 text-gray-500">
                    {user != null && user.email}
                  </Text>
                  <Text className="text-base font-light text-center -mt-1 text-gray-500">
                    {user != null && user.phone}
                  </Text>
                </View>
              </>
            )}

            {/* Button Logout */}
            <TouchableOpacity
              className=" mt-2 rounded-md shadow-sm bg-white "
              style={{ backgroundColor: colors.Main[500], width: "100%" }}
              onPress={() => {
                LogoutUser();
              }}
            >
              <View className="mx-2 py-4 px-3  rounded-t-md flex-row items-center">
                <MaterialIcons name="logout" size={20} color="white" />

                <Text className="text-base font-semibold ml-3 text-white">
                  Αποσύνδεση
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {!isProMember ? (
            <>
              <View className="px-3 mt-5">
                <SubBottomScreen
                  setopenSubBottomScreen={setopenSubBottomScreen}
                />
              </View>
            </>
          ) : (
            <>
              {/* CANCEL  Subscription */}
              <View className="px-3 mt-3">
                <TouchableOpacity
                  className=" mt-2 rounded-md  bg-white border "
                  style={{ borderColor: colors.Second[500], width: "100%" }}
                  onPress={() => {
                    cancelSubscription();
                  }}
                >
                  <View className="mx-2 py-4 px-3  rounded-t-md flex-row items-center">
                    <MaterialIcons name="cancel" size={20} color="gray" />

                    <Text className="text-base font-semibold ml-3 text-gray-700 ">
                      Ακύρωση συνδρομής
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Notifications */}
              <View className="px-3 mb-2 flex-row items-center mt-10">
                <MaterialCommunityIcons
                  name="bell"
                  size={24}
                  style={{ color: colors.Main[500] }}
                />
                <Text
                  className="text-lg font-semibold ml-2"
                  style={{ color: colors.Main[800] }}
                >
                  Ειδοποιήσεις
                </Text>
              </View>

              {/*  Notification */}
              <View className="px-3">
                {/* Comment Not */}
                <TouchableOpacity
                  className=" mt-2 rounded-md shadow-sm bg-white "
                  style={{ width: "100%" }}
                  onPress={() => {
                    navigateFunction(0);
                  }}
                >
                  <View className="mx-2 py-3 px-3  rounded-t-md flex-row items-center">
                    <View
                      className="mr-2 p-2 rounded-full border"
                      style={{ borderColor: colors.Second[500] }}
                    >
                      <Feather
                        name="bell"
                        size={22}
                        style={{ color: colors.Main[500] }}
                      />
                    </View>
                    <View>
                      <Text className="text-base font-light	">Σχόλια</Text>
                      <Text
                        className="text-base font-light -mt-1"
                        style={
                          commentsNotification == "0"
                            ? { color: "gray" }
                            : { color: "red" }
                        }
                      >
                        Έχεις {commentsNotification}
                        {commentsNotification === "1"
                          ? " σχόλιο αδιάβαστο"
                          : " σχόλια αδιάβαστα"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Message Not */}
                <TouchableOpacity
                  className=" mt-2 rounded-md shadow-sm bg-white "
                  style={{ width: "100%" }}
                  onPress={() => {
                    navigateFunction(1);
                  }}
                >
                  <View className="mx-2 py-3 px-3  rounded-t-md flex-row items-center">
                    <View
                      className="mr-2 p-2 rounded-full border"
                      style={{ borderColor: colors.Second[500] }}
                    >
                      <MaterialCommunityIcons
                        name="chat"
                        size={22}
                        style={{ color: colors.Main[500] }}
                      />
                    </View>
                    <View>
                      <Text className="text-base font-light	">Μηνύματα</Text>
                      <Text
                        className="text-base font-light -mt-1"
                        style={
                          chatNotification == "0"
                            ? { color: "gray" }
                            : { color: "red" }
                        }
                      >
                        Έχεις {chatNotification}
                        {chatNotification === "1"
                          ? " νέο μήνυμα"
                          : " νέα μηνύματα"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Contact */}
              <View className="px-3 mb-2 flex-row items-center mt-10">
                <MaterialCommunityIcons
                  name="mailbox"
                  size={24}
                  style={{ color: colors.Main[500] }}
                />
                <Text
                  className="text-lg font-semibold ml-2"
                  style={{ color: colors.Main[800] }}
                >
                  Επικοινωνία
                </Text>
              </View>
              <View className="px-3">
                <View
                  className=" mt-2 rounded-md shadow-sm bg-white "
                  style={{ width: "100%" }}
                >
                  <View className="mx-2 py-3 px-3  rounded-t-md flex-row items-center">
                    <View
                      className="mr-2 p-2 rounded-full border"
                      style={{ borderColor: colors.Second[500] }}
                    >
                      <Feather
                        name="phone"
                        size={22}
                        style={{ color: colors.Main[500] }}
                      />
                    </View>
                    <View>
                      <Text className="text-base font-light	">Τηλέφωνο</Text>
                      <Text className="text-base font-light text-gray-500 -mt-1">
                        +30 6989593525
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  className=" mt-2 rounded-md shadow-sm bg-white "
                  style={{ width: "100%" }}
                >
                  <View className="mx-2 py-3 px-3  rounded-t-md flex-row items-center">
                    <View
                      className="mr-2 p-2 rounded-full border"
                      style={{ borderColor: colors.Second[500] }}
                    >
                      <Feather
                        name="globe"
                        size={22}
                        style={{ color: colors.Main[500] }}
                      />
                    </View>
                    <View>
                      <Text className="text-base font-light	">Σελίδα</Text>
                      <Text className="text-base font-light text-gray-500 -mt-1">
                        www.infoagro.gr
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  className=" mt-2 rounded-md shadow-sm bg-white "
                  style={{ width: "100%" }}
                >
                  <View className="mx-2 py-3 px-3  rounded-t-md flex-row items-center">
                    <View
                      className="mr-2 p-2 rounded-full border"
                      style={{ borderColor: colors.Second[500] }}
                    >
                      <Feather
                        name="mail"
                        size={22}
                        style={{ color: colors.Main[500] }}
                      />
                    </View>
                    <View>
                      <Text className="text-base font-light	">
                        Ηλ. διεύθυνση
                      </Text>
                      <Text className="text-base font-light text-gray-500 -mt-1">
                        Peroulakis@infoagro.gr
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* EDIT/DELETE */}
              <View className="px-3 mb-2 mt-10">
                {/* Edit */}
                <TouchableOpacity
                  className=" mt-2 rounded-md shadow-sm bg-white "
                  style={{ width: "100%" }}
                  onPress={() => {
                    setsheet1IsVisible(true);
                  }}
                >
                  <View className="mx-2 py-4 px-3  rounded-t-md flex-row items-center">
                    <AntDesign name="edit" size={20} color="black" />

                    <Text className="text-base ml-3 text-gray-800 ">
                      Επεξεργασία Προφίλ
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* DELETE */}
                <TouchableOpacity
                  className=" mt-2 rounded-md shadow-sm bg-red-500 "
                  style={{ width: "100%" }}
                  onPress={() => {
                    setsheet2IsVisible(true);
                  }}
                >
                  <View className="mx-2 py-4 px-3  rounded-t-md flex-row items-center">
                    <Feather name="trash-2" size={20} color="white" />

                    <Text className="text-base font-semibold ml-3 text-white ">
                      Διαγραφή Λογαριασμού
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Sheet 1*/}
      <BottomSheet
        modalProps={{}}
        isVisible={sheet1isVisible}
        className="fixed inset-0 flex justify-end"
      >
        <SafeAreaView className="bg-white w-full max-w-md mx-auto rounded-t-lg shadow-lg">
          <View className="px-3 py-10">
            <Text className="text-xl font-semibold mb-2">
              Επεξεργασία Προφιλ
            </Text>

            <Text className="text-base mb-1">
              Αν όλα είναι εντάξει, θα μεταβείτε στην σελίδα σύνδεσης και πλέον
              μπορείτε να συνδεθείτε με τα νέα στοιχεία.
            </Text>

            {/* Φορμα επεξεργασίας */}
            <View style={styles.formContainer}>
              {/* Onoma */}
              <>
                <TextInput
                  className="shadow-sm"
                  style={styles.input}
                  placeholderTextColor="gray"
                  autoCapitalize="none"
                  placeholder="Όνομα"
                  returnKeyType="next"
                  value={user?.firstName}
                  onChangeText={handleFirstNameChange}
                />
              </>

              {/* Epitheto */}
              <>
                <TextInput
                  className="shadow-sm"
                  style={styles.input}
                  placeholder="Επώνυμο"
                  placeholderTextColor="gray"
                  returnKeyType="next"
                  value={user?.lastName}
                  onChangeText={handleLastNameChange}
                />
              </>

              {/* Email */}
              <>
                <TextInput
                  className="shadow-sm"
                  style={styles.input}
                  placeholder="Ηλ. Ταχυδρομείο"
                  placeholderTextColor="gray"
                  returnKeyType="next"
                  value={user?.email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                />
              </>

              {/* Password */}
              <>
                <TextInput
                  className="shadow-sm"
                  style={styles.input}
                  placeholder="Κωδικός"
                  placeholderTextColor="gray"
                  returnKeyType="next"
                  value={user?.password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                />
              </>

              {/* Phone */}
              <>
                <TextInput
                  className="shadow-sm"
                  style={styles.input}
                  placeholder="Τηλέφωνο"
                  placeholderTextColor="gray"
                  returnKeyType="next"
                  maxLength={10}
                  value={user?.phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                />
              </>
            </View>

            {/* FOrm Error */}
            <View>
              <Text>{accountError}</Text>
            </View>

            <View className="flex flex-row justify-around mt-5">
              <TouchableOpacity
                className="px-4 py-2 rounded border-2"
                style={{ borderColor: colors.Main[500] }}
                onPress={() => setsheet1IsVisible(false)}
              >
                <Text
                  className="text-blue-500 text-base font-bold"
                  style={{ color: colors.Main[500] }}
                >
                  Επιστροφή
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className=" px-4 py-2 rounded border-2 border-gray-400"
                style={{ backgroundColor: colors.Main[500] }}
                onPress={handleEditAccount}
              >
                <Text className="text-white text-base font-bold">
                  Αποθήκευση
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheet>

      {/* Bottom Sheet 2*/}
      <BottomSheet
        modalProps={{}}
        isVisible={sheet2isVisible}
        className="fixed inset-0 flex justify-end"
      >
        <SafeAreaView className="bg-white w-full max-w-md mx-auto rounded-t-lg shadow-lg">
          <View className="px-3 py-10">
            <Text className="text-xl font-semibold mb-2">
              Διαγραφή Λογαριασμού
            </Text>
            <Text className="text-lg mb-1">
              Είστε σίγουρος/η ότι θέλετε να διαγράψετε τον λογαριασμό σας;
            </Text>
            <Text className="text-base mb-4">
              Αυτή η διαδικασία είναι μη αναστρέψιμη.
            </Text>
            <View className="flex flex-row justify-around">
              <TouchableOpacity
                className="px-4 py-2 rounded border-2"
                style={{ borderColor: colors.Main[500] }}
                onPress={() => setsheet2IsVisible(false)}
              >
                <Text
                  className="text-blue-500 text-base font-bold"
                  style={{ color: colors.Main[500] }}
                >
                  Επιστροφή
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-500 px-4 py-2 rounded border-2 border-red-600"
                onPress={DeleteAccount}
              >
                <Text className="text-white text-base font-bold">Διαγραφή</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheet>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "lightgray",
    backgroundColor: "#fafafa",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  inputdate: {
    borderWidth: 1,
    borderColor: "lightgray",
    backgroundColor: "#fafafa",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 8,
    width: "30%",
  },
  inputgender: {
    borderWidth: 2,
    borderColor: "lightgray",
    backgroundColor: "#fafafa",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 8,
    width: "47%",
  },
  inputgender_selected: {
    borderWidth: 2,
    borderColor: colors.Second[500],
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 8,
    width: "47%",
  },
  button: {
    backgroundColor: colors.Second[500],
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 8,
  },
  buttonOutline: {
    borderColor: colors.Third[500],
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  termsContainer: {
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 5,
  },
  termsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "300",
    textAlign: "center",
  },
  infoContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  infoText: {
    color: "#fff",
    fontSize: 14,

    textAlign: "center",
  },
  errorText: {
    fontWeight: "500",
    color: "#fff",
    marginLeft: 5,
    marginTop: 2,
  },
  errorContainer: {
    backgroundColor: "red",
    padding: 3,
    marginTop: 4,
    borderRadius: 3,
  },
});

export default ProfileScreen;
