import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import LoadingComponent from "../components/structure/LoadingComponent";
import pack from "../package.json";
import colors from "../assets/Theme/colors";
import {
  createAnimatableComponent,
  View as AnimatableView,
} from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginUserApi, UserInfoApi, googleLoginApi } from "../apis/LoginApi";
import AsyncStorage from "../utils/AsyncStorage";
import { getSettingsApi } from "../apis/SettingsApi";
import SimpleIcons from "../components/icons/SimpleIcons";
import TermsAndPolicy from "../components/policy/TermsAndPolicy";
import LoginProblem from "../components/login/LoginProblem";
import useRevenueCat from "../hooks/useRevenueCat";
import useGoogleAuth from "../hooks/useGoogleAuth";
import useGoogleAuthOfficial from "../hooks/useGoogleAuthOfficial";
import useFirebaseAuth from "../hooks/useFirebaseAuth";
import FirebaseTestButton from "../components/FirebaseTestButton";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const AnimatedView = createAnimatableComponent(AnimatableView);

const redirectUri = AuthSession.makeRedirectUri({ scheme: "agrowise" });

const LoginScreen = () => {
  const [google_access_token, setgoogle_access_token] = useState();
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      "990770526562-ilsmjhrc84o6c624qnvr502dmouv9ukr.apps.googleusercontent.com",
    androidClientId:
      "990770526562-evnurvnbchnamickvau0fiq0ban0ifeb.apps.googleusercontent.com",
    iosClientId:
      "990770526562-ilsmjhrc84o6c624qnvr502dmouv9ukr.apps.googleusercontent.com",
    redirectUri: redirectUri,
  });

  React.useEffect(() => {
    if (response?.type === "success") {
      const { accessToken } = response.params;
      setgoogle_access_token(accessToken);
    }
  }, []);

  async function getUserInfo() {
    try {
      const response = await fetch(
        `https://www.googleapis.com/userinfo/v2/me`,
        {
          headers: {
            Authorization: `Bearer ${google_access_token}`,
          },
        }
      );
      const userInfo = await response.json();
      console.log("User Info:", userInfo);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  }

  // 1) Data
  const animatedViewRef = useRef(null);
  const navigation = useNavigation();
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [Error, setError] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [token, settoken] = useState(null);
  const [terms, setterms] = useState(null);
  const [policy, setpolicy] = useState(null);
  const [checkedRememberMe, setCheckedRememberMe] = React.useState(false);
  const toggleCheckbox = () => setCheckedRememberMe(!checkedRememberMe);
  const { isProMember } = useRevenueCat();
  const { signIn: googleSignIn, loading: googleLoading } = useGoogleAuth();
  const { signIn: googleSignInOfficial, loading: googleLoadingOfficial } =
    useGoogleAuthOfficial();
  const { signInWithGoogle: firebaseSignIn, loading: firebaseLoading } =
    useFirebaseAuth();

  const [isChecked, setChecked] = useState(false);
  const [overlayShow, setoverlayShow] = useState(false);
  const handleCheckboxToggle = () => {
    setChecked(!isChecked);
  };
  const [showPassword, setShowPassword] = useState(false);

  // Προσθήκη νέας κατάστασης για την εμφάνιση της φόρμας
  const [showLoginForm, setShowLoginForm] = useState(false);

  // Add this new state after your existing state declarations (around line 95)
  const [isAnyGoogleAuthInProgress, setIsAnyGoogleAuthInProgress] =
    useState(false);

  // 2) useEffects

  useEffect(() => {
    animateOnFocus();
    const unsubscribe = navigation.addListener("focus", animateOnFocus);

    // Ανάκτηση αποθηκευμένων στοιχείων από το AsyncStorage
    const getStoredCredentials = async () => {
      const rememberedUsername = await AsyncStorage.getItem(
        "rememberedUsername"
      );
      const rememberedPassword = await AsyncStorage.getItem(
        "rememberedPassword"
      );

      if (rememberedUsername && rememberedPassword) {
        setusername(rememberedUsername);
        setPassword(rememberedPassword);
        toggleCheckbox();
        // Εμφάνιση της φόρμας αν υπάρχουν αποθηκευμένα στοιχεία
        setShowLoginForm(true);
      }
    };

    getStoredCredentials();

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    getSettingsFunction();
    return;
  }, []);

  // 3) Functions
  const animateOnFocus = () => {
    if (animatedViewRef.current) {
      animatedViewRef.current.animate("zoomIn", 400);
    }
  };

  const handleLogin = async () => {
    if (username == null || password == null) {
      setError("*Παρακαλώ συμπληρώστε τα πεδία.");
      return;
    }

    LoginUserFunction();
  };

  const LoginUserFunction = async () => {
    try {
      setLoading(true);
      let devToken = await AsyncStorage.getItem("deviceToken");
      let device = 0;

      await rememberMeFunctionality();

      if (Platform.OS === "ios") {
        device = 2;
      } else if (Platform.OS === "android") {
        device = 1;
      }

      let bodyObject = {
        email: username,
        password: password,
        deviceToken: devToken,
        device: device,
      };

      console.log("BodyObject :", bodyObject);

      const response = await loginUserApi("apiUrl", bodyObject);
      const data = await response.json();

      if (data.resultCode === 1) {
        setError("*Εισάγετε σωστά στοιχεία χρήστη.");
      } else {
        setError(null);
        let extracted_token = data.response.token;

        AsyncStorage.setItem("userToken", extracted_token);

        await settoken(extracted_token);

        await getUserInfoFunction(extracted_token);

        // ⭐ FRESH RevenueCat check to prevent race condition
        console.log("🔐 Checking subscription status after successful login...");
        const subscriptionCheck = await checkSubscriptionWithRetry(isProMember);

        if (!subscriptionCheck.success) {
          // User cancelled the subscription check
          console.log("❌ User cancelled subscription check, staying on login screen");
          AsyncStorage.removeItem("userToken");
          AsyncStorage.removeItem("userInfo");
          setLoading(false);
          return;
        }

        // Check subscription status after successful login
        if (subscriptionCheck.isProMember) {
          AsyncStorage.setItem("ProMembership", "true");
          if (subscriptionCheck.usedFallback) {
            console.warn("⚠️ Logged in using fallback subscription status (RevenueCat check failed)");
          } else {
            console.log("✅ Pro member confirmed, navigating to Main");
          }
          navigation.navigate("Main");
        } else {
          // User has valid credentials but no active subscription
          console.log("❌ Not a pro member, showing subscription alert");
          AsyncStorage.removeItem("ProMembership");
          AsyncStorage.removeItem("userToken"); // Remove token to prevent access
          AsyncStorage.removeItem("userInfo"); // Remove user info

          setError(null); // Clear any existing errors
          Alert.alert(
            "Απαιτείται Συνδρομή",
            "Για να συνδεθείτε πρέπει να έχετε ενεργή συνδρομή. Μπορείτε να κάνετε εγγραφή για νέα συνδρομή ή να χρησιμοποιήσετε τη δοκιμαστική έκδοση για να εξερευνήσετε την εφαρμογή.",
            [
              {
                text: "Δοκιμαστική Χρήση",
                style: "cancel",
                onPress: () => {
                  handleTrialPeriodLogin();
                },
              },
              {
                text: "Εγγραφή",
                onPress: () => {
                  navigation.navigate("Subscription");
                },
              },
            ],
            { cancelable: false }
          );
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error 2:", error);
      setError("*Κάτι πήγε λαθος. Προσπαθήστε ξανα!");
    }
  };

  const navigateToRegister = () => {
    navigation.navigate("Register");
  };

  // Google Sign-In handler (original)
  const handleGoogleLogin = async () => {
    if (isAnyGoogleAuthInProgress) return; // Prevent multiple calls

    try {
      setIsAnyGoogleAuthInProgress(true);
      setError(null);

      console.log("Starting Google Sign-In (Original)...");

      // Use the Google Auth hook
      const result = await googleSignIn();

      if (result.success) {
        console.log("Google Sign-In successful:", result.user);

        // Check subscription status before allowing access
        if (isProMember) {
          AsyncStorage.setItem("ProMembership", "true");
          console.log("Navigating to main screen...");
          navigation.navigate("Main");
        } else {
          // User authenticated but no active subscription
          AsyncStorage.removeItem("ProMembership");

          Alert.alert(
            "Απαιτείται Συνδρομή",
            "Για να συνδεθείτε με Google πρέπει να έχετε ενεργή συνδρομή. Μπορείτε να κάνετε εγγραφή για νέα συνδρομή ή να χρησιμοποιήσετε τη δοκιμαστική έκδοση.",
            [
              {
                text: "Δοκιμαστική Χρήση",
                style: "cancel",
                onPress: () => {
                  handleTrialPeriodLogin();
                },
              },
              {
                text: "Εγγραφή",
                onPress: () => {
                  navigation.navigate("Subscription");
                },
              },
            ],
            { cancelable: false }
          );
        }
      } else {
        console.error("Google Sign-In failed:", result.error);

        if (result.code !== "USER_CANCELLED") {
          setError("*Σφάλμα σύνδεσης με Google. Προσπαθήστε ξανά.");
        }
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      setError("*Κάτι πήγε λάθος με τη σύνδεση Google. Προσπαθήστε ξανά.");
    } finally {
      setIsAnyGoogleAuthInProgress(false);
    }
  };

  // Firebase Google Sign-In handler
  const handleFirebaseGoogleLogin = async () => {
    if (isAnyGoogleAuthInProgress) return; // Prevent multiple calls

    try {
      setIsAnyGoogleAuthInProgress(true);
      setError(null);

      console.log("🔥 Starting Firebase Google Sign-In...");

      const result = await firebaseSignIn();

      if (result.success) {
        console.log("🎉 Firebase Google Sign-In successful:", result.user);

        // Get device token for backend
        let devToken = await AsyncStorage.getItem("deviceToken");
        let device = Platform.OS === "ios" ? 2 : 1;

        // Prepare body for backend authentication
        let bodyObject = {
          idToken: result.idToken, // Firebase ID token
          deviceToken: devToken,
          device: device,
        };

        console.log("🔄 Authenticating with backend...", bodyObject);

        // Call backend Google login API
        const response = await googleLoginApi("apiUrl", bodyObject);
        const data = await response.json();

        console.log("📋 Backend response:", data);

        if (data.resultCode === 0) {
          // Backend authentication successful
          setError(null);
          let extracted_token = data.response.token;

          // Store token and user info
          AsyncStorage.setItem("userToken", extracted_token);
          await AsyncStorage.setItem(
            "firebaseUser",
            JSON.stringify(result.user)
          );

          // Get user info from backend
          await getUserInfoFunction(extracted_token);

          // ⭐ FRESH RevenueCat check to prevent race condition (with retry)
          console.log("🔐 Checking subscription status after Firebase Google login...");
          const subscriptionCheck = await checkSubscriptionWithRetry(isProMember);

          if (!subscriptionCheck.success) {
            // User cancelled the subscription check
            console.log("❌ User cancelled subscription check");
            AsyncStorage.removeItem("userToken");
            AsyncStorage.removeItem("userInfo");
            AsyncStorage.removeItem("firebaseUser");
            return;
          }

          // Check subscription status before allowing access
          if (subscriptionCheck.isProMember) {
            AsyncStorage.setItem("ProMembership", "true");
            if (subscriptionCheck.usedFallback) {
              console.warn("⚠️ Logged in using fallback subscription status (RevenueCat check failed)");
            } else {
              console.log("✅ Pro member confirmed (RevenueCat), navigating to Main");
            }
            navigation.navigate("Main");
          } else {
            console.log("❌ Not a pro member (RevenueCat), showing subscription alert");
            // User authenticated but no active subscription
            AsyncStorage.removeItem("ProMembership");
            AsyncStorage.removeItem("userToken");
            AsyncStorage.removeItem("userInfo");

            Alert.alert(
              "Απαιτείται Συνδρομή",
              "Για να συνδεθείτε με Google πρέπει να έχετε ενεργή συνδρομή. Μπορείτε να κάνετε εγγραφή για νέα συνδρομή ή να χρησιμοποιήσετε τη δοκιμαστική έκδοση.",
              [
                {
                  text: "Δοκιμαστική Χρήση",
                  style: "cancel",
                  onPress: () => {
                    handleTrialPeriodLogin();
                  },
                },
                {
                  text: "Εγγραφή",
                  onPress: () => {
                    navigation.navigate("Subscription");
                  },
                },
              ],
              { cancelable: false }
            );
          }
        } else {
          // Backend authentication failed
          console.error("❌ Backend authentication failed:", data);
          setError("*Σφάλμα αυθεντικοποίησης. Προσπαθήστε ξανά.");
        }
      } else {
        console.error("❌ Firebase Google Sign-In failed:", result.error);

        if (result.code !== "USER_CANCELLED") {
          setError("*Σφάλμα σύνδεσης με Google. Προσπαθήστε ξανά.");
        }
      }
    } catch (error) {
      console.error("💥 Firebase Google Sign-In error:", error);
      setError("*Κάτι πήγε λάθος με τη σύνδεση Google. Προσπαθήστε ξανά.");
    } finally {
      setIsAnyGoogleAuthInProgress(false);
    }
  };

  // NEW Google Sign-In handler (Expo Official Pattern)
  const handleGoogleLoginOfficial = async () => {
    if (isAnyGoogleAuthInProgress) return; // Prevent multiple calls

    try {
      setIsAnyGoogleAuthInProgress(true);
      setError(null);

      console.log("🆕 Starting Google Sign-In (Expo Official Pattern)...");

      // Use the NEW Google Auth hook
      const result = await googleSignInOfficial();

      if (result.success) {
        console.log("🎉 Google Sign-In successful (Official):", result.user);

        // Get device token for backend
        let devToken = await AsyncStorage.getItem("deviceToken");
        let device = Platform.OS === "ios" ? 2 : 1;

        // Prepare body for backend authentication
        let bodyObject = {
          idToken: result.idToken, // Google ID token
          deviceToken: devToken,
          device: device,
        };

        console.log("🔄 Authenticating with backend...", bodyObject);

        // Call backend Google login API
        const response = await googleLoginApi("apiUrl", bodyObject);
        const data = await response.json();

        console.log("📋 Backend response:", data);

        if (data.resultCode === 0) {
          // Backend authentication successful
          setError(null);
          let extracted_token = data.response.token;

          // Store token and user info
          AsyncStorage.setItem("userToken", extracted_token);
          await AsyncStorage.setItem("googleUser", JSON.stringify(result.user));

          // Get user info from backend
          await getUserInfoFunction(extracted_token);

          // ⭐ FRESH RevenueCat check to prevent race condition (with retry)
          console.log("🔐 Checking subscription status after Google Official login...");
          const subscriptionCheck = await checkSubscriptionWithRetry(isProMember);

          if (!subscriptionCheck.success) {
            // User cancelled the subscription check
            console.log("❌ User cancelled subscription check");
            AsyncStorage.removeItem("userToken");
            AsyncStorage.removeItem("userInfo");
            AsyncStorage.removeItem("googleUser");
            return;
          }

          // Check subscription status before allowing access
          if (subscriptionCheck.isProMember) {
            AsyncStorage.setItem("ProMembership", "true");
            if (subscriptionCheck.usedFallback) {
              console.warn("⚠️ Logged in using fallback subscription status (RevenueCat check failed)");
            } else {
              console.log("✅ Pro member confirmed (RevenueCat), navigating to Main");
            }
            navigation.navigate("Main");
          } else {
            console.log("❌ Not a pro member (RevenueCat), showing subscription alert");
            // User authenticated but no active subscription
            AsyncStorage.removeItem("ProMembership");
            AsyncStorage.removeItem("userToken");
            AsyncStorage.removeItem("userInfo");

            Alert.alert(
              "Απαιτείται Συνδρομή",
              "Για να συνδεθείτε με Google πρέπει να έχετε ενεργή συνδρομή. Μπορείτε να κάνετε εγγραφή για νέα συνδρομή ή να χρησιμοποιήσετε τη δοκιμαστική έκδοση.",
              [
                {
                  text: "Δοκιμαστική Χρήση",
                  style: "cancel",
                  onPress: () => {
                    handleTrialPeriodLogin();
                  },
                },
                {
                  text: "Εγγραφή",
                  onPress: () => {
                    navigation.navigate("Subscription");
                  },
                },
              ],
              { cancelable: false }
            );
          }
        } else {
          // Backend authentication failed
          console.error("❌ Backend authentication failed:", data);
          setError("*Σφάλμα αυθεντικοποίησης. Προσπαθήστε ξανά.");
        }
      } else {
        console.error("❌ Google Sign-In failed (Official):", result.error);

        if (result.code !== "USER_CANCELLED") {
          setError("*Σφάλμα σύνδεσης με Google (Official). Προσπαθήστε ξανά.");
        }
      }
    } catch (error) {
      console.error("💥 Google Sign-In error (Official):", error);
      setError(
        "*Κάτι πήγε λάθος με τη σύνδεση Google (Official). Προσπαθήστε ξανά."
      );
    } finally {
      setIsAnyGoogleAuthInProgress(false);
    }
  };

  const getUserInfoFunction = async (token) => {
    try {
      const response = await UserInfoApi("apiUrl", token);
      const data = await response.json();

      if (data?.resultCode == 0) {
        let user = data?.response;
        AsyncStorage.setItem("userInfo", JSON.stringify(user));

        console.log("User Info Chat Id: ", user.chatId);

        if (user.chatId !== undefined) {
          AsyncStorage.setItem("chatId", user.chatId);
        } else {
          AsyncStorage.setItem("chatId", "");
        }
      }
    } catch (error) {
      console.log("Error :", error);
    }
  };

  const getSettingsFunction = async (token) => {
    try {
      const response = await getSettingsApi("apiUrl", 1, token);
      const data = await response.json();

      if (data?.resultCode == 0) {
        let t = data?.response?.data[0];
        let p = data?.response?.data[1];

        setterms(t?.url);
        setpolicy(p?.url);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error :", error);
    }
  };

  const rememberMeFunctionality = async () => {
    // Αποθήκευση στοιχείων στο AsyncStorage αν είναι επιλεγμένο το "Να με θυμάσαι"
    if (checkedRememberMe) {
      await AsyncStorage.setItem("rememberedUsername", username);
      await AsyncStorage.setItem("rememberedPassword", password);
    } else {
      // Καθαρισμός των στοιχείων αν δεν είναι επιλεγμένο
      await AsyncStorage.removeItem("rememberedUsername");
      await AsyncStorage.removeItem("rememberedPassword");
    }
  };

  // Helper function to check subscription with retry mechanism
  const checkSubscriptionWithRetry = async (hookIsProMember) => {
    const performCheck = async () => {
      try {
        // 🧪 Check if we're in development mode (bypassing payments)
        const { shouldBypassPayments } = require("../config/development");
        if (shouldBypassPayments()) {
          console.log("🧪 DEVELOPMENT MODE: Bypassing RevenueCat check, returning mock subscription");
          return { success: true, isProMember: true, usedFallback: false };
        }

        console.log("🔄 Fetching fresh RevenueCat subscription status...");
        const Purchases = require("react-native-purchases").default;
        const freshCustomerInfo = await Purchases.getCustomerInfo();

        const freshIsProMember =
          freshCustomerInfo.activeSubscriptions.includes("month_subscription") ||
          freshCustomerInfo.activeSubscriptions.includes("year_sub:1-year-sub-plan");

        console.log("✅ Fresh RevenueCat status:", freshIsProMember);
        console.log("📊 Active subscriptions:", freshCustomerInfo.activeSubscriptions);

        // Log if there's a mismatch (race condition detected)
        if (hookIsProMember !== freshIsProMember) {
          console.warn("⚠️ SUBSCRIPTION STATUS MISMATCH DETECTED!");
          console.warn("  Hook said:", hookIsProMember);
          console.warn("  Fresh check says:", freshIsProMember);
          console.warn("  → Using fresh check as source of truth");
        }

        return { success: true, isProMember: freshIsProMember };
      } catch (error) {
        console.error("❌ Failed to check RevenueCat subscription:", error);
        throw error;
      }
    };

    const showRetryAlert = () => {
      return new Promise((resolve) => {
        Alert.alert(
          "Σφάλμα Ελέγχου Συνδρομής",
          "Δεν μπορούμε να επιβεβαιώσουμε την κατάσταση της συνδρομής σας. Αυτό μπορεί να οφείλεται σε πρόβλημα δικτύου.\n\nΤι θέλετε να κάνετε;",
          [
            {
              text: "Επανάληψη",
              onPress: async () => {
                try {
                  const result = await performCheck();
                  resolve(result);
                } catch (retryError) {
                  // Failed again, show alert again (recursive retry)
                  const retryResult = await showRetryAlert();
                  resolve(retryResult);
                }
              },
            },
            {
              text: "Συνέχεια",
              onPress: () => {
                console.warn("⚠️ User chose to continue, using hook value:", hookIsProMember);
                resolve({ success: true, isProMember: hookIsProMember, usedFallback: true });
              },
            },
            {
              text: "Ακύρωση",
              style: "cancel",
              onPress: () => {
                resolve({ success: false, cancelled: true });
              },
            },
          ],
          { cancelable: false }
        );
      });
    };

    try {
      return await performCheck();
    } catch (error) {
      return await showRetryAlert();
    }
  };

  const handleTrialPeriodLogin = async () => {
    AsyncStorage.removeItem("userInfo");
    AsyncStorage.removeItem("userToken");
    if (isProMember) {
      AsyncStorage.setItem("ProMembership", "true");
    } else {
      AsyncStorage.removeItem("ProMembership");
    }
    navigation.navigate("Main");
  };

  const handleRegisterButton = async () => {
    if (isProMember) {
      navigateToRegister();
    } else {
      navigation.navigate("Subscription");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {Loading ||
          googleLoading ||
          googleLoadingOfficial ||
          firebaseLoading ||
          isAnyGoogleAuthInProgress ? (
            <View style={styles.loadingContainer}>
              <LoadingComponent />
            </View>
          ) : (
            <>
              {/* Conditional Header */}
              {showLoginForm ? (
                <View style={styles.loginHeader}>
                  <TouchableOpacity
                    style={styles.headerBackButton}
                    onPress={() => {
                      setError(null);
                      setShowLoginForm(false);
                    }}
                  >
                    <SimpleIcons name="arrow-back" size={24} color="white" />
                    <Text style={styles.headerBackText}>Πίσω</Text>
                  </TouchableOpacity>
                  <View style={styles.compactLogoContainer}>
                    <Text style={styles.logoTitle}>AgroWise</Text>
                    <Text style={styles.welcomeText}>
                      Latest news, Expert consulting
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.logoContainer}>
                  <Text style={styles.logoTitle}>AgroWise</Text>
                  <Text style={styles.welcomeText}>
                    Latest news, Expert consulting
                  </Text>
                </View>
              )}

              {/* Modern Clean Initial State */}
              {!showLoginForm && (
                <View style={styles.formContainer}>
                  {/* Google Sign In with Firebase */}
                  <TouchableOpacity
                    style={[styles.modernGoogleButton, styles.shadow]}
                    onPress={() => {
                      setError(null);
                      handleFirebaseGoogleLogin();
                    }}
                    disabled={
                      googleLoading ||
                      googleLoadingOfficial ||
                      firebaseLoading ||
                      isAnyGoogleAuthInProgress
                    }
                  >
                    <View style={styles.modernButtonContent}>
                      <SimpleIcons
                        name="google"
                        size={20}
                        color={colors.Main[600]}
                      />
                      <Text style={styles.modernGoogleText}>
                        Συνέχεια με Google
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Modern Divider */}
                  <View style={styles.modernDivider}>
                    <View style={styles.modernDividerLine} />
                    <Text style={styles.modernDividerText}>ή</Text>
                    <View style={styles.modernDividerLine} />
                  </View>

                  {/* Email Sign In */}
                  <TouchableOpacity
                    style={styles.modernEmailButton}
                    onPress={() => {
                      setError(null);
                      setShowLoginForm(true);
                    }}
                  >
                    <Text style={styles.modernEmailText}>
                      Συνέχεια με Email
                    </Text>
                  </TouchableOpacity>

                  {/* Firebase Test Button (temporary) - Commented out but kept for future testing */}
                  {/* <FirebaseTestButton /> */}

                  {/* Demo Access */}
                  <View style={styles.demoSection}>
                    <Text style={styles.demoPrompt}>
                      Θέλεις να δοκιμάσεις την εφαρμογή;
                    </Text>
                    <TouchableOpacity
                      style={styles.modernDemoButton}
                      onPress={() => {
                        setError(null);
                        handleTrialPeriodLogin();
                      }}
                    >
                      <Text style={styles.modernDemoText}>
                        Δοκιμή χωρίς εγγραφή
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Clean Email Form */}
              {showLoginForm && (
                <AnimatedView
                  animation="slideInUp"
                  duration={300}
                  style={styles.compactFormContainer}
                >
                  {/* Email Input */}
                  <TextInput
                    style={[styles.compactInput, styles.shadow]}
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    placeholder="Email"
                    returnKeyType="next"
                    value={username}
                    onChangeText={(text) => setusername(text)}
                  />

                  {/* Password Input */}
                  <View style={styles.compactPasswordContainer}>
                    <TextInput
                      style={[styles.compactPasswordInput, styles.shadow]}
                      placeholder="Κωδικός"
                      placeholderTextColor="#999"
                      returnKeyType="done"
                      value={password}
                      onChangeText={(text) => setPassword(text)}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.compactEyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <SimpleIcons
                        name={showPassword ? "eye-off" : "eye"}
                        size={18}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Remember Me */}
                  <TouchableOpacity
                    onPress={toggleCheckbox}
                    style={styles.compactRememberMe}
                  >
                    <SimpleIcons
                      name={
                        checkedRememberMe
                          ? "checkbox"
                          : "checkbox-blank-outline"
                      }
                      size={20}
                      color={
                        checkedRememberMe
                          ? colors.Second[400]
                          : "rgba(255,255,255,0.7)"
                      }
                    />
                    <Text style={styles.compactRememberText}>
                      Να με θυμάσαι
                    </Text>
                  </TouchableOpacity>

                  {/* Sign In Button */}
                  <TouchableOpacity
                    style={[styles.compactSignInButton, styles.shadow]}
                    onPress={handleLogin}
                  >
                    <Text style={styles.compactSignInText}>Σύνδεση</Text>
                  </TouchableOpacity>

                  {/* Register Link */}
                  <TouchableOpacity
                    style={styles.compactRegisterLink}
                    onPress={() => {
                      setError(null);
                      handleRegisterButton();
                    }}
                  >
                    <Text style={styles.compactRegisterText}>
                      Δεν έχεις λογαριασμό;{" "}
                      <Text style={styles.compactRegisterHighlight}>
                        Εγγραφή εδώ
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </AnimatedView>
              )}

              {/* Μηνύματα Λάθους (πάντα ορατά) */}
              <View style={styles.errorContainer}>
                {Error !== null && (
                  <Text style={styles.errorText}>{Error}</Text>
                )}
              </View>

              {/* Ξέχασες τον κωδικό; */}
              <View style={styles.forgotPasswordContainer}>
                <LoginProblem />
              </View>

              {/* Όροι και Πολιτική (πάντα ορατά) */}
              <View style={styles.termsContainer}>
                <TermsAndPolicy
                  setoverlayShow={setoverlayShow}
                  handleCheckboxToggle={handleCheckboxToggle}
                  setChecked={setChecked}
                  isChecked={isChecked}
                  overlayShow={overlayShow}
                  includeCheckbox={false}
                />
              </View>

              {/* Έκδοση (πάντα ορατή) */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Έκδοση: {pack.version}</Text>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Main[500],
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 10,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 25,
    paddingTop: 10,
  },
  logoTitle: {
    fontSize: 48,
    textAlign: "center",
    color: "white",
    fontWeight: "600",
  },
  welcomeText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontWeight: "300",
  },
  formContainer: {
    width: "85%",
    alignSelf: "center",
    paddingHorizontal: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "lightgray",
    backgroundColor: "#fafafa",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 6,
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 6,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "lightgray",
    backgroundColor: "#fafafa",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 15,
    paddingRight: 45,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -12 }],
    padding: 3,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  rememberMeText: {
    color: "white",
    fontWeight: "500",
    marginLeft: 5,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.Second[500],
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 6,
    flex: 1, // Για να μοιράζεται τον χώρο
    marginRight: 5, // Για απόσταση από το άλλο κουμπί
  },
  buttonOutline: {
    borderColor: colors.Third[500],
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
    flex: 1, // Για να μοιράζεται τον χώρο
    marginLeft: 5, // Για απόσταση από το άλλο κουμπί
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  trialButton: {
    backgroundColor: colors.Main[600],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginTop: 12,
  },
  errorContainer: {
    marginTop: 12,
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
  forgotPasswordContainer: {
    paddingHorizontal: 16,
  },
  termsContainer: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  termsText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "300",
    textAlign: "center",
  },
  infoContainer: {
    alignItems: "center",
    marginTop: 8,
    paddingBottom: 15,
  },
  infoText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  border: {
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 15,
  },
  googleButtonOfficial: {
    backgroundColor: "#34A853", // Different green color for the new approach
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 15,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  backButton: {
    marginBottom: 20,
    alignSelf: "flex-start",
    padding: 10,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 15,
  },
  loginButton: {
    marginBottom: 0,
    marginRight: 5,
  },
  registerButton: {
    marginBottom: 0,
    marginLeft: 5,
  },
  googleButtonForm: {
    marginTop: 5,
  },

  // Modern Styles
  modernGoogleButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  modernButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modernGoogleIcon: {
    marginRight: 12,
  },
  modernGoogleText: {
    color: colors.Main[600],
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  modernDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  modernDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  modernDividerText: {
    marginHorizontal: 16,
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    fontWeight: "500",
  },
  modernEmailButton: {
    backgroundColor: colors.Main[700],
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.Main[600],
    shadowColor: "transparent",
    elevation: 0,
  },
  modernEmailText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  modernDemoButton: {
    paddingVertical: 15,
    marginTop: 0,
  },
  modernDemoText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },

  // Form Styles
  modernBackButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 8,
  },
  modernBackText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  formTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
  },
  modernInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#000",
  },
  modernPasswordContainer: {
    position: "relative",
    marginBottom: 16,
  },
  modernPasswordInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    color: "#000",
  },
  modernEyeIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  modernRememberMe: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  modernRememberText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  modernSignInButton: {
    backgroundColor: colors.Second[500],
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  modernSignInText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  modernRegisterLink: {
    paddingVertical: 8,
  },
  modernRegisterText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
  },
  modernRegisterHighlight: {
    color: colors.Second[400],
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // Demo Section
  demoSection: {
    alignItems: "center",
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  demoPrompt: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 0,
  },

  // Login Header (when form is shown)
  loginHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  headerBackButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  headerBackText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  compactLogoContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  compactLogoTitle: {
    fontSize: 32,
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },

  // Compact Form Styles
  compactFormContainer: {
    width: "85%",
    alignSelf: "center",
    paddingHorizontal: 15,
  },
  compactFormTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  compactInput: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 15,
    color: "#000",
  },
  compactPasswordContainer: {
    position: "relative",
    marginBottom: 12,
  },
  compactPasswordInput: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    paddingRight: 45,
    fontSize: 15,
    color: "#000",
  },
  compactEyeIcon: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: [{ translateY: -9 }],
  },
  compactRememberMe: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  compactRememberText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  compactSignInButton: {
    backgroundColor: colors.Second[500],
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  compactSignInText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  compactRegisterLink: {
    paddingVertical: 6,
  },
  compactRegisterText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    textAlign: "center",
  },
  compactRegisterHighlight: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 18,
  },
});

export default LoginScreen;
