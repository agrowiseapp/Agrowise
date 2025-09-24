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
import { loginUserApi, UserInfoApi } from "../apis/LoginApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSettingsApi } from "../apis/SettingsApi";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import TermsAndPolicy from "../components/policy/TermsAndPolicy";
import LoginProblem from "../components/login/LoginProblem";
import useRevenueCat from "../hooks/useRevenueCat";
import useGoogleAuth from "../hooks/useGoogleAuth";
import useGoogleAuthOfficial from "../hooks/useGoogleAuthOfficial";
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

        if (isProMember) {
          AsyncStorage.setItem("ProMembership", "true");
        } else {
          AsyncStorage.removeItem("ProMembership");
        }

        navigation.navigate("Main");
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

        // Here you can integrate with your backend to create/login user
        // For now, we'll navigate to main screen
        // You may want to call your backend API to register/login with Google user data

        console.log("Navigating to main screen...");
        navigation.navigate("Main");
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

        // Here you can integrate with your backend to create/login user
        // For now, we'll navigate to main screen

        console.log("Navigating to main screen...");
        navigation.navigate("Main");
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

  const handleRegisterButton = (async = () => {
    if (isProMember) {
      navigateToRegister();
    } else {
      navigation.navigate("Subscription");
    }
  });

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
          isAnyGoogleAuthInProgress ? (
            <View style={styles.loadingContainer}>
              <LoadingComponent />
            </View>
          ) : (
            <>
              <View style={styles.logoContainer}>
                <Text style={styles.logoTitle}>AgroWise</Text>
                <Text style={styles.welcomeText}>
                  Latest news, Expert consulting
                </Text>
              </View>

              {/* Εμφάνιση αρχικών κουμπιών (default state) */}
              {!showLoginForm && (
                <View style={styles.formContainer}>
                  <TouchableOpacity
                    style={[styles.googleButton, styles.shadow]}
                    onPress={async () => {
                      if (isAnyGoogleAuthInProgress) return;
                      setIsAnyGoogleAuthInProgress(true);
                      try {
                        if (google_access_token) {
                          await getUserInfo();
                        } else {
                          await promptAsync({ showInRecents: true });
                        }
                      } finally {
                        setIsAnyGoogleAuthInProgress(false);
                      }
                    }}
                    disabled={
                      googleLoading ||
                      googleLoadingOfficial ||
                      isAnyGoogleAuthInProgress
                    }
                  >
                    <Text style={styles.buttonText}>
                      Συνέχεια με Google New
                    </Text>
                  </TouchableOpacity>
                  {/* Κουμπί Google Sign In */}
                  <TouchableOpacity
                    style={[styles.googleButton, styles.shadow]}
                    onPress={handleGoogleLogin}
                    disabled={
                      googleLoading ||
                      googleLoadingOfficial ||
                      isAnyGoogleAuthInProgress
                    }
                  >
                    <View style={styles.googleButtonContent}>
                      <AntDesign
                        name="google"
                        size={20}
                        color="white"
                        style={styles.googleIcon}
                      />
                      <Text style={styles.googleButtonText}>
                        Συνέχεια με Google
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* NEW Google Sign In Button (Expo Official) */}
                  <TouchableOpacity
                    style={[styles.googleButtonOfficial, styles.shadow]}
                    onPress={handleGoogleLoginOfficial}
                    disabled={
                      googleLoading ||
                      googleLoadingOfficial ||
                      isAnyGoogleAuthInProgress
                    }
                  >
                    <View style={styles.googleButtonContent}>
                      <AntDesign
                        name="google"
                        size={20}
                        color="white"
                        style={styles.googleIcon}
                      />
                      <Text style={styles.googleButtonText}>
                        Google (Expo Official) 🆕
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Διαχωριστής "ή" */}
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>ή</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Κουμπί για εμφάνιση φόρμας σύνδεσης */}
                  <TouchableOpacity
                    style={[styles.buttonOutline, styles.shadow, styles.border]}
                    onPress={() => setShowLoginForm(true)}
                  >
                    <Text style={styles.buttonText}>
                      Συνδέσου με απλό χρήστη
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Εμφάνιση φόρμας σύνδεσης με animation (μόνο όταν το showLoginForm είναι true) */}
              {showLoginForm && (
                <AnimatedView
                  animation="slideInUp"
                  duration={500}
                  style={styles.formContainer}
                >
                  <TextInput
                    style={[styles.input, styles.shadow]}
                    placeholderTextColor="gray"
                    autoCapitalize="none"
                    placeholder="Email"
                    returnKeyType="next"
                    value={username}
                    onChangeText={(text) => setusername(text)}
                  />

                  {/* Πεδίο Κωδικού με εικονίδιο ματιού */}
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.passwordInput, styles.shadow]}
                      placeholder="Κωδικός"
                      placeholderTextColor="gray"
                      returnKeyType="done"
                      value={password}
                      onChangeText={(text) => setPassword(text)}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? "eye-off" : "eye"}
                        size={24}
                        color="gray"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Να με θυμάσαι */}
                  <TouchableOpacity
                    onPress={toggleCheckbox}
                    style={styles.rememberMeContainer}
                  >
                    {!checkedRememberMe ? (
                      <MaterialCommunityIcons
                        name="checkbox-blank-outline"
                        size={22}
                        color="white"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="checkbox-intermediate"
                        size={22}
                        color={colors.Second[500]}
                      />
                    )}
                    <Text style={styles.rememberMeText}>Να με θυμάσαι</Text>
                  </TouchableOpacity>

                  {/* Κουμπιά Σύνδεσης και Εγγραφής δίπλα-δίπλα */}
                  <View style={styles.buttonRow}>
                    {/* Κουμπί Σύνδεσης */}
                    <TouchableOpacity
                      style={[styles.button, styles.shadow, styles.loginButton]}
                      onPress={handleLogin}
                    >
                      <Text style={styles.buttonText}>Σύνδεση</Text>
                    </TouchableOpacity>

                    {/* Κουμπί Εγγραφής */}
                    <TouchableOpacity
                      style={[
                        styles.buttonOutline,
                        styles.shadow,
                        styles.registerButton,
                      ]}
                      onPress={handleRegisterButton}
                    >
                      <Text style={styles.buttonText}>Εγγραφή</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Σύνδεση με Google */}
                  <TouchableOpacity
                    style={[
                      styles.googleButton,
                      styles.shadow,
                      styles.googleButtonForm,
                    ]}
                    onPress={handleGoogleLogin}
                    disabled={
                      googleLoading ||
                      googleLoadingOfficial ||
                      isAnyGoogleAuthInProgress
                    }
                  >
                    <View style={styles.googleButtonContent}>
                      <AntDesign
                        name="google"
                        size={20}
                        color="white"
                        style={styles.googleIcon}
                      />
                      <Text style={styles.googleButtonText}>
                        Σύνδεση με Google
                      </Text>
                    </View>
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
});

export default LoginScreen;
