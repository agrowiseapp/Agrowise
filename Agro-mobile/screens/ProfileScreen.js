import {
  Text,
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
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useRef, useState } from "react";
import ScreenTitle from "../components/structure/ScreenTitle";
import { useNavigation } from "@react-navigation/native";
import {
  createAnimatableComponent,
  View as AnimatableView,
} from "react-native-animatable";
import colors from "../assets/Theme/colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "../utils/AsyncStorage";
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
  const [commentsNotification, setcommentsNotification] = useState("0");
  const [chatNotification, setchatNotification] = useState("0");
  const [sheet1isVisible, setsheet1IsVisible] = useState(false);
  const [sheet2isVisible, setsheet2IsVisible] = useState(false);
  const [accountError, setaccountError] = useState(false);
  const [isProMember, setisProMember] = useState(false);
  const [openSubBottomScreen, setopenSubBottomScreen] = useState(false);

  // 2) UseEffects
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
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
    setcommentsNotification(commentsNotifications || "0");
    setchatNotification(chatNotifications || "0");
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
      if (data.resultCode === 0) {
        LogoutUser();
      } else {
        setaccountError("*" + data.message);
      }
    } catch (error) {
      console.log("Error :", error);
    }
  };

  const LogoutUser = async () => {
    await AsyncStorage.removeItem("userToken");
    navigation.navigate("Login");
  };

  const getAvatarSource = (avatarId, profilePicture) => {
    if (profilePicture) {
      return { uri: profilePicture };
    }
    return avatars[avatarId] || avatars[1];
  };

  const validateForm = async () => {
    let oneError = await validateFirstName();
    let twoError = await validateLastName();
    let threeError = await validateEmail();
    let fourError = await validatePassword();
    let fiveError = await validatePhone();
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
    const isSupported = await Linking.canOpenURL("app-settings:");
    if (Platform.OS == "android") {
      Linking.openSettings();
      return;
    }
    if (isSupported) {
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
      <SafeAreaView style={styles.safeAreaView}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <ScreenTitle title="Προφίλ" back={true} navigation={navigation} />
        </View>
        <ScrollView style={styles.scrollView}>
          {/* Profile */}
          <View style={styles.profileSection}>
            {!isProMember ? (
              <>
                <View style={styles.profileImageContainer}>
                  <View style={styles.profileImageWrapper}>
                    <Image
                      source={getAvatarSource(
                        user?.avatar,
                        user?.profilePicture
                      )}
                      style={styles.avatarImage}
                    />
                  </View>
                </View>
                <View style={styles.nameWrapper}>
                  <Text style={styles.guestText}>
                    Έχετε συνδεθεί ως επισκέπτης
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.profileImageContainer}>
                  <View style={styles.profileImageWrapper}>
                    {user !== null && (
                      <Image
                        source={getAvatarSource(
                          user?.avatar,
                          user?.profilePicture
                        )}
                        style={styles.avatarImage}
                      />
                    )}
                  </View>
                </View>
                <View style={styles.nameWrapper}>
                  <Text style={styles.proNameText}>
                    {user != null && user.firstName + " " + user.lastName}
                  </Text>
                  <Text style={styles.proInfoText}>
                    {user != null && user.email}
                  </Text>
                  <Text style={styles.proInfoText}>
                    {user != null && user.phone}
                  </Text>
                </View>
              </>
            )}

            {/* Button Logout */}
            <TouchableOpacity
              style={[styles.buttonBase, styles.logoutButton]}
              onPress={() => {
                LogoutUser();
              }}
            >
              <View style={styles.buttonInnerView}>
                <Ionicons name="log-out-outline" size={20} color="white" />
                <Text style={styles.logoutButtonText}>Αποσύνδεση</Text>
              </View>
            </TouchableOpacity>
          </View>

          {!isProMember ? (
            <>
              <View style={styles.subContainer}>
                <SubBottomScreen
                  setopenSubBottomScreen={setopenSubBottomScreen}
                />
              </View>
            </>
          ) : (
            <>
              {/* CANCEL  Subscription */}
              <View style={styles.cancelSubContainer}>
                <TouchableOpacity
                  style={[styles.buttonBase, styles.cancelSubButton]}
                  onPress={() => {
                    cancelSubscription();
                  }}
                >
                  <View style={styles.buttonInnerView}>
                    <Ionicons name="close-outline" size={20} color="gray" />
                    <Text style={styles.cancelSubButtonText}>
                      Ακύρωση συνδρομής
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Notifications */}
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={colors.Main[500]}
                />
                <Text style={styles.sectionHeaderText}>Ειδοποιήσεις</Text>
              </View>

              {/* Notification Cards */}
              <View style={styles.cardContainer}>
                {/* Comment Not */}
                <TouchableOpacity
                  style={[styles.cardBase, styles.notificationCard]}
                  onPress={() => {
                    navigateFunction(0);
                  }}
                >
                  <View style={styles.cardInnerView}>
                    <View style={styles.cardIconWrapper}>
                      <Ionicons
                        name="notifications-outline"
                        size={22}
                        color={colors.Main[500]}
                      />
                    </View>
                    <View>
                      <Text style={styles.cardTextTitle}>Σχόλια</Text>
                      <Text
                        style={[
                          styles.cardTextSubtitle,
                          commentsNotification == "0"
                            ? styles.noNotificationText
                            : styles.hasNotificationText,
                        ]}
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
                  style={[styles.cardBase, styles.notificationCard]}
                  onPress={() => {
                    navigateFunction(1);
                  }}
                >
                  <View style={styles.cardInnerView}>
                    <View style={styles.cardIconWrapper}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={22}
                        color={colors.Main[500]}
                      />
                    </View>
                    <View>
                      <Text style={styles.cardTextTitle}>Μηνύματα</Text>
                      <Text
                        style={[
                          styles.cardTextSubtitle,
                          chatNotification == "0"
                            ? styles.noNotificationText
                            : styles.hasNotificationText,
                        ]}
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
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="mail-outline"
                  size={24}
                  color={colors.Main[500]}
                />
                <Text style={styles.sectionHeaderText}>Επικοινωνία</Text>
              </View>
              <View style={styles.cardContainer}>
                <View style={[styles.cardBase, styles.contactCard]}>
                  <View style={styles.cardInnerView}>
                    <View style={styles.cardIconWrapper}>
                      <Ionicons
                        name="call-outline"
                        size={22}
                        color={colors.Main[500]}
                      />
                    </View>
                    <View>
                      <Text style={styles.cardTextTitle}>Τηλέφωνο</Text>
                      <Text style={styles.contactCardText}>+30 6989593525</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.cardBase, styles.contactCard]}>
                  <View style={styles.cardInnerView}>
                    <View style={styles.cardIconWrapper}>
                      <Ionicons
                        name="globe-outline"
                        size={22}
                        color={colors.Main[500]}
                      />
                    </View>
                    <View>
                      <Text style={styles.cardTextTitle}>Σελίδα</Text>
                      <Text style={styles.contactCardText}>
                        www.infoagro.gr
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.cardBase, styles.contactCard]}>
                  <View style={styles.cardInnerView}>
                    <View style={styles.cardIconWrapper}>
                      <Ionicons
                        name="mail-outline"
                        size={22}
                        color={colors.Main[500]}
                      />
                    </View>
                    <View>
                      <Text style={styles.cardTextTitle}>Ηλ. διεύθυνση</Text>
                      <Text style={styles.contactCardText}>
                        Peroulakis@infoagro.gr
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* EDIT/DELETE */}
              <View style={styles.editDeleteContainer}>
                <TouchableOpacity
                  style={[styles.buttonBase, styles.editButton]}
                  onPress={() => {
                    setsheet1IsVisible(true);
                  }}
                >
                  <View style={styles.buttonInnerView}>
                    <Ionicons name="create-outline" size={20} color="black" />
                    <Text style={styles.editText}>Επεξεργασία Προφίλ</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.buttonBase, styles.deleteButton]}
                  onPress={() => {
                    setsheet2IsVisible(true);
                  }}
                >
                  <View style={styles.buttonInnerView}>
                    <Ionicons name="trash-outline" size={20} color="white" />
                    <Text style={styles.deleteButtonText}>
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
        containerStyle={styles.bottomSheetModal}
      >
        <SafeAreaView style={styles.bottomSheetWrapper}>
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>Επεξεργασία Προφιλ</Text>
            <Text style={styles.bottomSheetSubtitle}>
              Αν όλα είναι εντάξει, θα μεταβείτε στην σελίδα σύνδεσης και πλέον
              μπορείτε να συνδεθείτε με τα νέα στοιχεία.
            </Text>
            <View style={styles.formContainer}>
              <>
                <TextInput
                  style={[styles.input, styles.shadow]}
                  placeholderTextColor="gray"
                  autoCapitalize="none"
                  placeholder="Όνομα"
                  returnKeyType="next"
                  value={user?.firstName}
                  onChangeText={handleFirstNameChange}
                />
              </>
              <>
                <TextInput
                  style={[styles.input, styles.shadow]}
                  placeholder="Επώνυμο"
                  placeholderTextColor="gray"
                  returnKeyType="next"
                  value={user?.lastName}
                  onChangeText={handleLastNameChange}
                />
              </>
              <>
                <TextInput
                  style={[styles.input, styles.shadow]}
                  placeholder="Ηλ. Ταχυδρομείο"
                  placeholderTextColor="gray"
                  returnKeyType="next"
                  value={user?.email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                />
              </>
              <>
                <TextInput
                  style={[styles.input, styles.shadow]}
                  placeholder="Κωδικός"
                  placeholderTextColor="gray"
                  returnKeyType="next"
                  value={user?.password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                />
              </>
              <>
                <TextInput
                  style={[styles.input, styles.shadow]}
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
            <View>
              <Text>{accountError}</Text>
            </View>
            <View style={styles.bottomSheetButtonContainer}>
              <TouchableOpacity
                style={styles.bottomSheetReturnButton}
                onPress={() => setsheet1IsVisible(false)}
              >
                <Text style={styles.bottomSheetReturnText}>Επιστροφή</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bottomSheetSaveButton}
                onPress={handleEditAccount}
              >
                <Text style={styles.bottomSheetSaveText}>Αποθήκευση</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheet>

      {/* Bottom Sheet 2*/}
      <BottomSheet
        modalProps={{}}
        isVisible={sheet2isVisible}
        containerStyle={styles.bottomSheetModal}
      >
        <SafeAreaView style={styles.bottomSheetWrapper}>
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>Διαγραφή Λογαριασμού</Text>
            <Text style={styles.deleteSubtitle}>
              Είστε σίγουρος/η ότι θέλετε να διαγράψετε τον λογαριασμό σας;
            </Text>
            <Text style={styles.deleteWarningText}>
              Αυτή η διαδικασία είναι μη αναστρέψιμη.
            </Text>
            <View style={styles.bottomSheetButtonContainer}>
              <TouchableOpacity
                style={styles.bottomSheetReturnButton}
                onPress={() => setsheet2IsVisible(false)}
              >
                <Text style={styles.bottomSheetReturnText}>Επιστροφή</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButtonAlert}
                onPress={DeleteAccount}
              >
                <Text style={styles.bottomSheetSaveText}>Διαγραφή</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheet>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    flexDirection: "column",
    width: "100%",
    paddingBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileSection: {
    paddingHorizontal: 12,
    marginTop: 20,
  },
  profileImageContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  profileImageWrapper: {
    height: 96,
    width: 96,
    backgroundColor: "#fff",
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  nameWrapper: {
    marginTop: 12,
    marginBottom: 12,
  },
  guestText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  proNameText: {
    fontSize: 20,
    textAlign: "center",
  },
  proInfoText: {
    fontSize: 16,
    fontWeight: "300",
    textAlign: "center",
    marginTop: -4,
    color: "#6b7280",
  },
  // Button Styles
  buttonBase: {
    marginTop: 8,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  buttonInnerView: {
    marginHorizontal: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: colors.Main[500],
    width: "100%",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    color: "white",
  },
  // Subcription Section
  subContainer: {
    paddingHorizontal: 12,
    marginTop: 20,
  },
  cancelSubContainer: {
    paddingHorizontal: 12,
    marginTop: 12,
  },
  cancelSubButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.Second[500],
    width: "100%",
  },
  cancelSubButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    color: "#4b5563",
  },
  // Notification/Contact/Edit Sections
  sectionHeader: {
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: colors.Main[800],
  },
  cardContainer: {
    paddingHorizontal: 12,
  },
  cardBase: {
    marginTop: 8,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    backgroundColor: "#fff",
    width: "100%",
  },
  cardInnerView: {
    marginHorizontal: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  cardIconWrapper: {
    marginRight: 8,
    padding: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.Second[500],
  },
  cardTextTitle: {
    fontSize: 16,
    fontWeight: "300",
  },
  cardTextSubtitle: {
    fontSize: 16,
    fontWeight: "300",
    marginTop: -4,
  },
  noNotificationText: {
    color: "gray",
  },
  hasNotificationText: {
    color: "red",
  },
  contactCardText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#6b7280",
    marginTop: -4,
  },
  editDeleteContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
    marginTop: 40,
  },
  editButton: {
    backgroundColor: "#fff",
  },
  editText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#1f2937",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    width: "100%",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    color: "white",
  },
  // Bottom Sheet Styles
  bottomSheetModal: {
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: "flex-end",
  },
  bottomSheetWrapper: {
    backgroundColor: "white",
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetContent: {
    paddingHorizontal: 12,
    paddingVertical: 40,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  bottomSheetSubtitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  deleteSubtitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  deleteWarningText: {
    fontSize: 16,
    marginBottom: 16,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
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
  bottomSheetButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  bottomSheetReturnButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.Main[500],
  },
  bottomSheetReturnText: {
    color: colors.Main[500],
    fontSize: 16,
    fontWeight: "700",
  },
  bottomSheetSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#9ca3af",
    backgroundColor: colors.Main[500],
  },
  bottomSheetSaveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteButtonAlert: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#dc2626",
  },
});

export default ProfileScreen;
