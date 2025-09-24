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
import React, { useEffect, useRef, useState } from "react";
import LoadingComponent from "../components/structure/LoadingComponent";
import colors from "../assets/Theme/colors";
import {
  createAnimatableComponent,
  View as AnimatableView,
} from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerUserApi } from "../apis/LoginApi";
import { Avatar } from "@rneui/themed";
import Avatar5 from "../assets/images/avatar5.png";
import Avatar6 from "../assets/images/avatar6.png";
import Avatar7 from "../assets/images/avatar7.png";
import Avatar8 from "../assets/images/avatar8.png";
import TermsAndPolicy from "../components/policy/TermsAndPolicy";
import SimpleIcons from "../components/icons/SimpleIcons";

const AnimatedView = createAnimatableComponent(AnimatableView);
const avatars = {
  5: Avatar5,
  6: Avatar6,
  7: Avatar7,
  8: Avatar8,
};

const RegisterScreen = () => {
  // 1) Data
  const animatedViewRef = useRef(null);
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [showPassword, setshowPassword] = useState(true);
  const [phone, setPhone] = useState("");
  const [gender, setgender] = useState(0);
  const [dateDay, setdateDay] = useState("");
  const [dateMonth, setdateMonth] = useState("");
  const [dateYear, setdateYear] = useState("");
  const [avatar, setAvatar] = useState(5);

  const [Error, setError] = useState(null);
  const [Success, setSuccess] = useState(false);
  const [error1, seterror1] = useState(null);
  const [error2, seterror2] = useState(null);
  const [error3, seterror3] = useState(null);
  const [error4, seterror4] = useState(null);
  const [error5, seterror5] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [buttonIsPressed, setbuttonIsPressed] = useState(false);

  const [isChecked, setChecked] = useState(false);
  const [overlayShow, setoverlayShow] = useState(false);

  const handleCheckboxToggle = () => {
    setChecked(!isChecked);
  };

  // 2) useEffects

  useEffect(() => {
    animateOnFocus();
    const unsubscribe = navigation.addListener("focus", animateOnFocus);

    return unsubscribe;
  }, [navigation]);

  // 3) Functions
  const animateOnFocus = () => {
    if (animatedViewRef.current) {
      animatedViewRef.current.animate("zoomIn", 400);
    }
  };

  const handleRegister = async () => {
    let check = await validateForm();

    if (check) RegisterNewUser();
  };

  const navigateToLogin = () => {
    navigation.navigate("Login");
  };

  const RegisterNewUser = async () => {
    try {
      let dob = dateDay + "-" + dateMonth + "-" + dateYear;

      let bodyObject = {
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        isAdmin: false,
        avatar: avatar,
        gender: gender,
        dateOfBirth: dob,
      };
      authAppKey = "@gr0w1s3Application!@#123";

      const response = await registerUserApi("apiUrl", bodyObject, authAppKey);
      const data = await response.json();

      console.log("Data: ", data);

      if (data.resultCode === 1) {
        setError("*" + data.message);
        setSuccess(false);
      } else {
        setError(null);
        setSuccess(true);
      }
    } catch (error) {
      console.log("Error 5:", error);
      setError("*" + error);
    }
  };

  //sets and validates
  const validateForm = async () => {
    let oneError = await validateFirstName();
    let twoError = await validateLastName();
    let threeError = await validateEmail();
    let fourError = await validatePassword();
    let fiveError = await validatePhone();
    //let sixError = await validateDOB();

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
    if (firstName == null || firstName == "" || firstName?.length < 4) {
      seterror1("*To όνομα είναι απαραίτητο");
      return true;
    } else {
      seterror1(null);
      return false;
    }
  };

  const validateLastName = async () => {
    if (lastName == null || lastName == "" || lastName?.length < 4) {
      seterror2("*To Επώνυμο είναι απαραίτητο");
      return true;
    } else {
      seterror2(null);
      return false;
    }
  };

  const validateEmail = async () => {
    if (email == null || email == "" || email?.length < 4) {
      seterror3("*Ένα έγκυρο Email είναι απαραίτητο");
      return true;
    } else {
      let reg = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (reg.test(email)) {
        seterror3(null);
        return false;
      } else {
        seterror3("*Ένα έγκυρο Email είναι απαραίτητο");
        return true;
      }
    }
  };

  const validatePassword = async () => {
    if (password == null || password == "" || password?.length < 6) {
      seterror4("*Ο Κωδικός πρέπει να περιέχει τουλάχιστον 6 ψηφία");
      return true;
    } else {
      if (password !== confirmPassword) {
        seterror4("*Οι Κωδικοί δεν ταιριάζουν");
        return true;
      } else {
        seterror4(null);
        return false;
      }
    }
  };

  const validatePhone = async () => {
    if (phone == null || phone == "" || phone?.length < 10) {
      seterror5("*Ένας έγκυρος Αριθμός Τηλεφώνου είναι απαραίτητος");
      return true;
    } else {
      seterror5(null);
      return false;
    }
  };

  const changeAvatar = (num) => {
    setAvatar(num);
  };

  const getAvatarSource = (avatarId) => {
    return avatars[avatarId] || avatars[1];
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.containerKeyboard}
        behavior={Platform.OS === "ios" ? "padding" : null}
      >
        {Loading ? (
          <>
            <View className="flex-1 flex-row justify-center items-center">
              <LoadingComponent />
            </View>
          </>
        ) : (
          <ScrollView
            className="flex flex-1 w-full"
            contentContainerStyle={{
              alignItems: "center",
            }}
            horizontal={false} // Add this line to disable horizontal scrolling
          >
            {/* Title - Header */}
            <View style={styles.logoContainer}>
              <View>
                {/* Image */}

                <Text className="text-5xl text-center text-white font-semibold">
                  AgroWise
                </Text>
                <Text style={styles.welcomeText}>Εγγραφή νέου χρήστη</Text>
              </View>
            </View>

            {/* User Created - Not Created */}
            {Success ? (
              <>
                <View className="mt-10 px-3 ">
                  <Text className="text-xl text-white text-center">
                    Ο χρήστης δημιουργήθηκε επιτυχώς!
                  </Text>

                  <Text className="text-center  text-white text-base font-light">
                    Επιστροφή στην σελίδα σύνδεσης
                  </Text>

                  {/* REGISTER BUTTON */}
                  <TouchableOpacity
                    style={styles.button}
                    className="shadow-sm mt-10"
                    onPress={navigateToLogin}
                  >
                    <Text style={styles.buttonText}>Επιστροφή</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Register Form */}
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
                      value={firstName}
                      onChangeText={(text) => setFirstName(text)}
                    />
                    {/* Error */}
                    {error1 !== null && error1 !== "" && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error1}</Text>
                      </View>
                    )}
                  </>

                  {/* Epitheto */}
                  <>
                    <TextInput
                      className="shadow-sm"
                      style={styles.input}
                      placeholder="Επώνυμο"
                      placeholderTextColor="gray"
                      returnKeyType="next"
                      value={lastName}
                      onChangeText={(text) => setLastName(text)}
                    />
                    {/* Error */}
                    {error2 !== null && error2 !== "" && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error2}</Text>
                      </View>
                    )}
                  </>

                  {/* Email */}
                  <>
                    <TextInput
                      className="shadow-sm"
                      style={styles.input}
                      placeholder="Ηλ. Ταχυδρομείο"
                      placeholderTextColor="gray"
                      returnKeyType="next"
                      value={email}
                      onChangeText={(text) => setemail(text)}
                      keyboardType="email-address"
                    />
                    {/* Error */}
                    {error3 !== null && error3 !== "" && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error3}</Text>
                      </View>
                    )}
                  </>

                  {/* Password */}
                  <>
                    <TextInput
                      className="shadow-sm"
                      style={styles.input}
                      placeholder="Κωδικός"
                      placeholderTextColor="gray"
                      returnKeyType="next"
                      value={password}
                      onChangeText={(text) => setPassword(text)}
                      secureTextEntry={showPassword ? true : false}
                    />
                  </>

                  {/* Confirm Password */}
                  <View
                    className="flex-row justify-center items-center"
                    style={styles.inputPass}
                  >
                    <TextInput
                      className="shadow-sm flex-1 py-4"
                      placeholder="Επανάληψη Κωδικού"
                      placeholderTextColor="gray"
                      returnKeyType="next"
                      value={confirmPassword}
                      onChangeText={(text) => setconfirmPassword(text)}
                      secureTextEntry={showPassword ? true : false}
                    />
                    {/* Show Password */}
                    <TouchableOpacity
                      onPress={() => {
                        setshowPassword(!showPassword);
                      }}
                    >
                      {showPassword ? (
                        <Text>
                          <SimpleIcons name="eye" size={24} color="gray" />
                        </Text>
                      ) : (
                        <Text>
                          <SimpleIcons name="eye-off" size={24} color="gray" />
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Password Error */}
                  {/* Error */}
                  {error4 !== null && error4 !== "" && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{error4}</Text>
                    </View>
                  )}

                  {/* Phone */}
                  <>
                    <TextInput
                      className="shadow-sm"
                      style={styles.input}
                      placeholder="Τηλέφωνο"
                      placeholderTextColor="gray"
                      returnKeyType="next"
                      maxLength={10}
                      value={phone}
                      keyboardType="phone-pad"
                      onChangeText={(text) => setPhone(text)}
                    />
                    {/* Error */}
                    {error5 !== null && error5 !== "" && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText} className="mb-3">
                          {error5}
                        </Text>
                      </View>
                    )}
                  </>

                  {/* Avatar */}
                  <>
                    <Text className="text-base text-white ml-3 mt-5 font-semibold">
                      Επιλέξτε Avatar
                    </Text>
                    <View className="flex-row justify-around items-center  mt-1 mb-2">
                      <TouchableOpacity
                        style={avatar === 5 ? styles.avatar_selected : ""}
                        onPress={() => {
                          changeAvatar(5);
                        }}
                      >
                        <Image
                          source={getAvatarSource(5)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: "#fff",
                          }}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={avatar === 6 ? styles.avatar_selected : ""}
                        onPress={() => {
                          changeAvatar(6);
                        }}
                      >
                        <Image
                          source={getAvatarSource(6)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: "#fff",
                          }}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={avatar === 7 ? styles.avatar_selected : ""}
                        onPress={() => {
                          changeAvatar(7);
                        }}
                      >
                        <Image
                          source={getAvatarSource(7)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: "#fff",
                          }}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={avatar === 8 ? styles.avatar_selected : ""}
                        onPress={() => {
                          changeAvatar(8);
                        }}
                      >
                        <Image
                          source={getAvatarSource(8)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: "#fff",
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  </>

                  {/* Terms */}
                  <View style={styles.termsContainer}>
                    {/* Terms */}
                    <TermsAndPolicy
                      setoverlayShow={setoverlayShow}
                      handleCheckboxToggle={handleCheckboxToggle}
                      setChecked={setChecked}
                      isChecked={isChecked}
                      overlayShow={overlayShow}
                      includeCheckbox={true}
                    />
                  </View>

                  {/* REGISTER BUTTON */}
                  <TouchableOpacity
                    style={[
                      styles.button,
                      {
                        backgroundColor: colors.Second[500],
                        opacity: !isChecked ? 0.5 : 1, // Disable button if isLoading or checkbox is not checked
                      },
                    ]}
                    className="shadow-sm mt-5 mb-10"
                    onPress={handleRegister}
                    disabled={!isChecked && buttonIsPressed} // Disable button if isLoading or checkbox is not checked
                  >
                    <Text style={styles.buttonText}>
                      Δημιουργία Λογαριασμού
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Error Messages`` */}
                <View className="mt-1">
                  {Error !== null && (
                    <Text className="text-center text-base font-semibold text-red-700">
                      {Error}
                    </Text>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.Main[500],
  },
  containerKeyboard: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.Main[500],
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  logo: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    fontWeight: "300",
  },
  formContainer: {
    width: "80%",
    paddingHorizontal: 20,
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
  inputPass: {
    borderWidth: 1,
    borderColor: "lightgray",
    backgroundColor: "#fafafa",
    borderRadius: 25,
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
    marginBottom: 50,
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
    marginTop: 1,
    width: "90%",
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
  avatar_selected: {
    borderWidth: 4,
    borderColor: colors.Main[700],
    borderRadius: 25,
  },
});

export default RegisterScreen;
