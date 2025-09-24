import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../assets/Theme/colors";
import Pro from "../../assets/images/crown.png";
import Purchases from "react-native-purchases";
import TermsAndPolicy from "../policy/TermsAndPolicy";
import AsyncStorage from "../../utils/AsyncStorage";
import SimpleIcons from "../icons/SimpleIcons";

const Subscription = ({ currentOffering, setTrialPeriod }) => {
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
    <SafeAreaView style={styles.modernContainer}>
      {/* Centered Header */}
      <View style={styles.centeredHeader}>
        <Image source={Pro} style={styles.centeredLogo} resizeMode="contain" />
        <Text style={styles.centeredTitle}>AgroWise Premium</Text>
        <Text style={styles.centeredSubtitle}>Πλήρης εμπειρία αγροτικής ενημέρωσης</Text>
      </View>

      <ScrollView 
        style={styles.modernContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >

        {!isLoading ? (
          <>
            {/* Ultra Compact Features */}
            <View style={styles.ultraCompactFeatures}>
              {[
                { 
                  icon: "checkcircleo", 
                  text: "Πλήρη Πρόσβαση", 
                  description: "Αποκλειστικό περιεχόμενο και όλες οι λειτουργίες της εφαρμογής" 
                },
                { 
                  icon: "clockcircleo", 
                  text: "Έγκαιρες Ειδοποιήσεις", 
                  description: "Ειδήσεις και ανακοινώσεις που σε ενδιαφέρουν αυτόματα" 
                },
                { 
                  icon: "staro", 
                  text: "Συμβουλές Ειδικών", 
                  description: "Εξειδικευμένη υποστήριξη από έμπειρους αγροτικούς συμβούλους" 
                }
              ].map((feature, index) => (
                <View key={index} style={styles.ultraCompactFeatureCard}>
                  <View style={styles.featureIconBadge}>
                    <SimpleIcons name={feature.icon} size={16} color="white" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.ultraCompactFeatureText}>{feature.text}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Ultra Compact Pricing */}
            {!currentOffering ? (
              <View style={styles.ultraCompactLoadingCard}>
                <ActivityIndicator size="small" color={colors.Second[500]} />
                <Text style={styles.ultraCompactLoadingText}>Ετοιμάζουμε την προσφορά...</Text>
              </View>
            ) : (
              <View style={styles.ultraCompactPricingContainer}>
                {Platform.OS === "ios" ? (
                  <TouchableOpacity
                    onPress={handleMonthlyPurchase}
                    style={[
                      styles.mainPricingCard,
                      { opacity: isLoading || !isChecked ? 0.6 : 1 }
                    ]}
                    disabled={isLoading || !isChecked}
                  >
                    {isLoading ? (
                      <View style={styles.ultraCompactLoadingRow}>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={styles.ultraCompactLoadingTextWhite}>Επεξεργασία...</Text>
                      </View>
                    ) : (
                      <View style={styles.pricingContent}>
                        <View style={styles.priceSection}>
                          <Text style={styles.mainPriceText}>{currentOffering?.monthly?.product.priceString}</Text>
                          <Text style={styles.mainPeriodText}>/μήνα</Text>
                        </View>
                        <Text style={styles.mainActionText}>Ξεκίνα Premium</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleAnnualPurchase}
                    style={[
                      styles.mainPricingCard,
                      { opacity: isLoading || !isChecked ? 0.6 : 1 }
                    ]}
                    disabled={isLoading || !isChecked}
                  >
                    {isLoading ? (
                      <View style={styles.ultraCompactLoadingRow}>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={styles.ultraCompactLoadingTextWhite}>Επεξεργασία...</Text>
                      </View>
                    ) : (
                      <View style={styles.pricingContent}>
                        <View style={styles.priceSection}>
                          <Text style={styles.mainPriceText}>{currentOffering?.annual?.product.priceString}</Text>
                          <Text style={styles.mainPeriodText}>/έτος</Text>
                        </View>
                        <Text style={styles.mainActionText}>Ξεκίνα Premium</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Compact Guest Access */}
            <TouchableOpacity
              onPress={handleTrialPeriod}
              style={[
                styles.compactGuestButton,
                { opacity: isLoading || !isChecked ? 0.6 : 1 }
              ]}
              disabled={isLoading || !isChecked}
            >
              <Text style={styles.compactGuestButtonText}>Συνέχεια ως Επισκέπτης</Text>
            </TouchableOpacity>

            {/* Compact Terms */}
            <View style={styles.modernTermsContainer}>
              <TermsAndPolicy
                setoverlayShow={setoverlayShow}
                handleCheckboxToggle={handleCheckboxToggle}
                setChecked={setChecked}
                isChecked={isChecked}
                overlayShow={overlayShow}
                includeCheckbox={true}
              />
            </View>

            {/* Important Disclaimer */}
            <View style={styles.importantDisclaimer}>
              <Text style={styles.importantDisclaimerText}>
                ✓ Ακύρωση ανά πάσα στιγμή από το profile σας
              </Text>
              <Text style={styles.importantDisclaimerText}>
                ✓ Καμία υποχρέωση • Άμεση ενεργοποίηση
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.modernLoadingState}>
            <View style={styles.modernLoadingContent}>
              <ActivityIndicator size="large" color={colors.Main[300]} />
              <Text style={styles.modernLoadingTitle}>
                Επεξεργασία Αγοράς
              </Text>
              <Text style={styles.modernLoadingDescription}>
                Δημιουργούμε ένα ασφαλές περιβάλλον για την αγορά σας.
                Θα σας μεταφέρουμε στην εφαρμογή σύντομα.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modernContainer: {
    flex: 1,
    backgroundColor: colors.Main[700],
  },
  centeredHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  centeredLogo: {
    width: 56,
    height: 56,
    marginBottom: 16,
  },
  centeredTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  centeredSubtitle: {
    fontSize: 15,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
  },
  modernContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  ultraCompactFeatures: {
    marginBottom: 20,
  },
  ultraCompactFeatureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.Second[500],
  },
  featureIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.Second[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  ultraCompactFeatureText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
  },
  ultraCompactLoadingCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ultraCompactLoadingText: {
    color: colors.Second[500],
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  ultraCompactPricingContainer: {
    marginBottom: 16,
  },
  mainPricingCard: {
    backgroundColor: colors.Main[500],
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pricingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  mainPriceText: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
  },
  mainPeriodText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 2,
  },
  mainActionText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
  },
  ultraCompactLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ultraCompactLoadingTextWhite: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  compactGuestButton: {
    backgroundColor: colors.Main[800],
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  compactGuestButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  modernLoadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modernLoadingContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 24,
    maxWidth: 300,
  },
  modernLoadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modernLoadingDescription: {
    fontSize: 14,
    color: colors.Second[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  modernTermsContainer: {
    marginBottom: 12,
  },
  importantDisclaimer: {
    marginBottom: 32,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
  },
  importantDisclaimerText: {
    fontSize: 13,
    color: 'white',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
    fontWeight: '500',
  },
});

export default Subscription;
