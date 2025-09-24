import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import React, { useState } from "react";
import colors from "../../assets/Theme/colors";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Pro from "../../assets/images/crown.png";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TermsAndPolicy from "../policy/TermsAndPolicy";
import useRevenueCat from "../../hooks/useRevenueCat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";

const SubBottomScreen = ({ setopenSubBottomScreen }) => {
  //1) Data
  // State to manage loading state during purchase
  const navigation = useNavigation();
  const { isProMember, currentOffering } = useRevenueCat();
  const [isLoading, setLoading] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [overlayShow, setoverlayShow] = useState(false);

  //Functions
  const handleMonthlyPurchase = async () => {
    if (!currentOffering?.monthly) return;
    //console.log("Removing trialPeriod");
    //AsyncStorage.removeItem("trialPeriod");

    try {
      // Show optimistic UI update while waiting for server response
      setLoading(true);

      const purchaserInfo = await Purchases.purchasePackage(
        currentOffering.monthly
      );

      console.log("purchaser info : ", purchaserInfo);

      setLoading(false);

      if (purchaserInfo.customerInfo.entitlements.active.Pro) {
        freshStartWithMembership();
      }
    } catch (error) {
      setLoading(false);
      console.error("Error during purchase:", error);
      if (!error.userCancelled) {
        console.log("Error without user cancel");
      }
      // Handle any errors that might occur during the purchase process
    }
  };

  const handleAnnualPurchase = async () => {
    if (!currentOffering?.annual) return;

    //console.log("Removing trialPeriod");
    //AsyncStorage.removeItem("trialPeriod");
    //AsyncStorage.removeItem("t");

    try {
      // Show optimistic UI update while waiting for server response
      setLoading(true);

      const purchaserInfo = await Purchases.purchasePackage(
        currentOffering.annual
      );

      console.log("purchaser info : ", purchaserInfo);

      setLoading(false);

      if (purchaserInfo.customerInfo.entitlements.active.Pro) {
        freshStartWithMembership();
      }
    } catch (error) {
      setLoading(false);
      console.log("Error during purchase : ", JSON.stringify(error));

      if (!error.userCancelled) {
        //showError(error);
      }
      // Handle any errors that might occur during the purchase process
    }
  };

  const handleCheckboxToggle = () => {
    setChecked(!isChecked);
  };

  const freshStartWithMembership = async () => {
    console.log("IS PRO");
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("ProMembership");
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.Main[700] }}
    >
      <ScrollView className="h-full flex-1">
        {/* Header */}
        <View className="my-4 space-y-2">
          <Text className="text-2xl text-center uppercase text-white font-bold">
            ΑΝΑΒΑΘΜΙΣΗ
          </Text>
          <Text className=" text-center text-white">
            Αναβαθμίστε τώρα στην premium έκδοση για πρόσβαση σε όλες τις
            λειτουργίες
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          onPress={() => setopenSubBottomScreen(false)}
          className="absolute top-0 right-0 p-5"
        >
          <AntDesign name="closecircle" size={28} color={colors.Second[500]} />
        </TouchableOpacity>

        {!isLoading ? (
          <>
            {/* Logo */}
            <View className="items-center">
              <Image source={Pro} resizeMode="contain" className="w-16 h-16" />
            </View>
            <View className="space-y-5  px-5 ">
              {/* First */}

              <View className="flex-row space-x-10 mt-5 items-center">
                <MaterialCommunityIcons
                  name="message-badge"
                  size={24}
                  color={colors.Second[500]}
                />
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">
                    Πλήρες Πρόσβαση
                  </Text>
                  <Text className="text-white text-sm font-light">
                    Κάντε αναβάθμιση στην Premium έκδοση της εφαρμογής και
                    απολαύστε αποκλειστικό περιεχόμενο και πρόσβαση σε όλες τις
                    λειτουργίες όπως Έγκαιρη ενημέρωση και συμβουλευτική κάλυψη.
                  </Text>
                </View>
              </View>
              {/* Terms */}
              <View className="mb-5">
                <TermsAndPolicy
                  setoverlayShow={setoverlayShow}
                  handleCheckboxToggle={handleCheckboxToggle}
                  setChecked={setChecked}
                  isChecked={isChecked}
                  overlayShow={overlayShow}
                  includeCheckbox={true}
                />
              </View>
            </View>

            {/* Buttons */}
            {!currentOffering ? (
              <View style={styles.feature}>
                <View
                  className="flex-1 flex-row justify-center items-center mt-9 rounded-full px-10"
                  style={{ backgroundColor: colors.Main[700], opacity: 0.5 }}
                >
                  <ActivityIndicator size="large" color="white" />
                  <Text className="font-semibold text-sm text-white mt-1 ml-3 ">
                    Παρακαλώ περιμένετε όσο ετοιμάζουμε την προσφορά για εσας!
                  </Text>
                </View>
              </View>
            ) : (
              <>
                {Platform.OS == "ios" ? (
                  <>
                    {/* Monthly Button */}
                    <View className="px-4 ">
                      <TouchableOpacity
                        onPress={handleMonthlyPurchase}
                        className="flex-1"
                        style={[
                          styles.button,
                          {
                            backgroundColor: colors.Main[500],
                            opacity: isLoading || !isChecked ? 0.5 : 1, // Disable button if isLoading or checkbox is not checked
                          },
                        ]}
                        disabled={isLoading || !isChecked} // Disable button if isLoading or checkbox is not checked
                      >
                        {isLoading ? (
                          <View className="flex-row">
                            <ActivityIndicator size="large" color="white" />
                            <Text className="font-semibold text-sm text-white mt-1 ml-3 ">
                              Παρακαλώ περιμένετε όσο επεξεργαζόμαστε την αγορά!
                            </Text>
                          </View>
                        ) : (
                          <>
                            <Text style={styles.buttonText}>
                              Αναβάθμιση σε Premium
                            </Text>
                            <Text style={styles.buttonText}>
                              {currentOffering?.monthly?.product.priceString}
                              /Μήνα
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Year Button */}
                    <View className="px-4 ">
                      <TouchableOpacity
                        onPress={handleAnnualPurchase}
                        className="flex-1"
                        style={[
                          styles.button,
                          {
                            backgroundColor: colors.Main[500],
                            opacity: isLoading || !isChecked ? 0.5 : 1, // Disable button if isLoading or checkbox is not checked
                          },
                        ]}
                        disabled={isLoading || !isChecked} // Disable button if isLoading or checkbox is not checked
                      >
                        {isLoading ? (
                          <View className="flex-row">
                            <ActivityIndicator size="large" color="white" />
                            <Text className="font-semibold text-sm text-white mt-1 ml-3 ">
                              Παρακαλώ περιμένετε όσο επεξεργαζόμαστε την αγορά!
                            </Text>
                          </View>
                        ) : (
                          <>
                            <Text style={styles.buttonText}>
                              Αναβάθμιση σε Premium
                            </Text>
                            <Text style={styles.buttonText}>
                              {currentOffering?.annual?.product.priceString}
                              /'Ετος
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </>
            )}

            {/* Disclaimer Cancel sub */}
            <View className="flex-1 mb-3 mt-5">
              <Text className="text-white font-semibold text-lg">
                *Ακύρωση συνδρομής
              </Text>
              <Text className="text-white text-sm font-light">
                Μην ανυσηχείτε, μπορείτε να ακυρώσετε την συνδρομή σας ανα πάσα
                στιγμή από το profile σας. Διαβάστε περισσότερα στους όρους
                χρήσης
              </Text>
            </View>
          </>
        ) : (
          <>
            <View className="flex-1 ">
              <View>
                <Text className="text-white text-base font-semibold mb-5 leading-5">
                  ➤ Ευχαριστούμε που κάνατε αίτηση για εγγραφή στην συνδρομητική
                  υπηρεσία της AgroWise.
                </Text>

                <Text className="text-white text-base leading-5 mb-5">
                  ➤ Παρακαλώ περιμένετε όσο δημιουργούμε ένα ασφαλές περιβάλλον
                  για την αγορά σας.
                </Text>
              </View>

              <ActivityIndicator size="large" color="white" />
              <Text className="text-white text-sm leading-4 my-5 text-center">
                *Η διαδικασία αυτή δεν θα κρατήσει πολύ. Μετά την επιτυχής
                ολοκλήρωση της συνδρομής θα μεταβείτε στην εφαρμογή.
                Ευχαριστούμε για την υπομονή σας!
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default SubBottomScreen;
