import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import colors from "../../assets/Theme/colors";
import Pro from "../../assets/images/crown.png";
import Purchases from "react-native-purchases";
import TermsAndPolicy from "../policy/TermsAndPolicy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

const Subscription = ({ currentOffering, setTrialPeriod }) => {
  // State to manage loading state during purchase
  const buildFor = "android";
  const [isLoading, setLoading] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [overlayShow, setoverlayShow] = useState(false);

  const handleMonthlyPurchase = async () => {
    if (!currentOffering?.monthly) return;

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

  const handleTrialPeriod = () => {
    Alert.alert(
      "Συνέχεια ως επισκέπτης",
      "Περιηγηθείτε στην εφαρμογή μας, με περιορισμένο περιεχόμενο χωρίς να χρεωθείτε ποτέ.",
      [
        {
          text: "Πίσω",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Συνέχεια",
          onPress: () => {
            AsyncStorage.setItem("trialPeriod", "true");
            console.log("set trial period true");
            setTrialPeriod(true);
          },
        },
      ]
    );
  };

  const freshStartWithMembership = async () => {
    console.log("IS PRO");
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("ProMembership");
    AsyncStorage.removeItem("trialPeriod");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        {/* Title */}
        <Text style={styles.title}>ΑΝΑΒΑΘΜΙΣΗ</Text>

        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image source={Pro} style={styles.image} resizeMode="contain" />
        </View>

        {!isLoading ? (
          <>
            {/* Pro Λειτουργίες */}

            <View className="space-y-2  px-1 py-4">
              {/* First */}
              <View className="flex-row space-x-10 items-center">
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
                    λειτουργίες.
                  </Text>
                </View>
              </View>

              {/* Second */}
              <View className="flex-row space-x-10 items-center">
                <FontAwesome5 name="key" size={24} color={colors.Second[500]} />
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">
                    Έγκαιρη Ενημέρωση
                  </Text>
                  <Text className="text-white text-sm font-light">
                    Λαμβάνεις ειδήσεις και ανακοινώσεις που σε ενδιαφέρουν
                    αυτόματα στην οθόνη σου.
                  </Text>
                </View>
              </View>

              {/* Third */}
              <View className="flex-row space-x-10 items-center">
                <AntDesign name="star" size={24} color={colors.Second[500]} />
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">
                    Συμβουλές από Ειδικούς
                  </Text>
                  <Text className="text-white text-sm font-light">
                    Χρειάζεσαι συμβουλές; Εμπιστεύσου την έμπειρη ομάδα μας και
                    λάβε εξειδικευμένη υποστήριξη σε chat ή σχόλιο.
                  </Text>
                </View>
              </View>
            </View>

            {/* Disclaimer Cancel sub */}
            <View className="flex-1 mb-3">
              <Text className="text-white font-semibold text-lg">
                *Ακύρωση συνδρομής
              </Text>
              <Text className="text-white text-sm font-light">
                Μην ανυσηχείτε, μπορείτε να ακυρώσετε την συνδρομή σας ανα πάσα
                στιγμή από το profile σας. Διαβάστε περισσότερα στους όρους
                χρήσης
              </Text>
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
                    <View className="mt-3 flex-1">
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
                    <View className="mt-3 flex-1">
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

            {/* Trial Period Button */}
            <View className="mt-3 flex-1">
              <TouchableOpacity
                onPress={handleTrialPeriod}
                className="flex-1"
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.Second[400],
                    opacity: isLoading || !isChecked ? 0.5 : 1, // Disable button if isLoading or checkbox is not checked
                  },
                ]}
                disabled={isLoading || !isChecked} // Disable button if isLoading or checkbox is not checked
              >
                <>
                  <Text style={styles.buttonText}>Συνέχεια ως Eπισκέπτης</Text>
                  <Text className="text-center text-white">
                    Περιορισμένο περιεχόμενο, χωρίς χρέωση
                  </Text>
                </>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <View className="mb-20">
              <TermsAndPolicy
                setoverlayShow={setoverlayShow}
                handleCheckboxToggle={handleCheckboxToggle}
                setChecked={setChecked}
                isChecked={isChecked}
                overlayShow={overlayShow}
                includeCheckbox={true}
              />
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
  container: {
    flex: 1,
    backgroundColor: colors.Main[700],
    alignItems: "center",
  },
  contentContainer: {
    width: "90%",
  },

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
  title: {
    fontSize: 28,
    fontWeight: "500",
    marginBottom: 30,
    marginTop: 0,
    textAlign: "center",
    color: "#fff",
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    textAlign: "start",
  },
  featureText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    justifyContent: "flex-start",
    marginLeft: 10,
    color: "#fff",
  },
  featureTextLarge: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
    fontWeight: "400",
    marginTop: 5,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 5,
  },
  image: {
    width: 50,
    height: 50,
  },
});

export default Subscription;
