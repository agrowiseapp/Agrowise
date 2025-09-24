import {
  Text,
  Button,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useEffect, useRef, useState } from "react";
import ScreenTitle from "../components/structure/ScreenTitle";
import Posts from "../components/news/Posts";
import { SearchBar } from "@rneui/themed";
import Loading from "../components/structure/Loading";
import {
  createAnimatableComponent,
  View as AnimatableView,
} from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../assets/Theme/colors";
import { AntDesign } from "@expo/vector-icons";
import { getPostsApi, getPostsWithUserCommentsApi } from "../apis/PostsApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { CheckBox } from "@rneui/themed";
import TrialPosts from "../components/news/TrialPosts";
import useRevenueCat from "../hooks/useRevenueCat";
import CheckIsPro from "../components/utils/CheckIsPro";

const AnimatedView = createAnimatableComponent(AnimatableView);

const NewsScreen = ({ route }) => {
  // 1) Data
  const animatedViewRef = useRef(null);
  const animatedPostsRefs = useRef([]);
  const navigation = useNavigation();
  const [filterText, setfilterText] = useState(null);
  const [posts, setposts] = useState(null);
  const [filteredPosts, setfilteredPosts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, settoken] = useState(null);
  const [showFilters, setshowFilters] = useState(false);
  const [filter, setfilter] = useState(0);
  const [firstTime, setfirstTime] = useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isProMember, setisProMember] = useState(false);

  const [trialPeriodContent, settrialPeriodContent] = useState([
    {
      _id: "66a9e7b0ff9317ec7f74d5dd",
      author: "GIANNIS PEROULAKIS - (Διαχειριστής)",
      comments: 0,
      publishedAt: "2024-07-31T07:28:48.197Z",
      replyComments: 0,
      text: "Όσες κτηνοτροφικές εκμεταλλεύσεις προσβληθούν από Πανώλη με τα αντίστοιχα δικαιολογητικά που αποδεικνύουν την ύπαρξη της ασθένειας θα μπορούν να απαλλαγούν από κάποιες δεσμεύσεις για το πρόγραμμα νέων αγροτών αλλά και τα σχέδια βελτίωσης (ανωτέρα βία).",
      title: "Πανώλη και προγράμματα Νέων Αγροτών - Σχέδια Βελτίωσης",
      unreadComments: 0,
    },
    {
      _id: "66a7a7925e5d060e92064b1a",
      author: "GIANNIS PEROULAKIS - (Διαχειριστής)",
      comments: 0,
      publishedAt: "2024-07-29T14:30:42.096Z",
      replyComments: 0,
      text: "Με απόφαση του υπουργού Αγροτικής Ανάπτυξης και Τροφίμων, Κώστα Τσιάρα, και με αφορμή τον εντοπισμό κρουσμάτων πανώλης των μικρών μηρυκαστικών και σε άλλες περιοχές της χώρας, εκτός Θεσσαλίας, απαγορεύεται η μετακίνηση αιγοπροβάτων για αναπαραγωγή, πάχυνση και σφαγή, σε ολόκληρη την επικράτεια.",
      title:
        "H Ελλάδα σε καραντίνα λόγω πανώλης, απαγόρευση μετακίνησης αιγοπροβάτων παντού",
      unreadComments: 0,
    },
    {
      _id: "66a4dabc1210e0aa9dc94388",
      author: "GIANNIS PEROULAKIS - (Διαχειριστής)",
      comments: 0,
      publishedAt: "2024-07-27T11:32:12.030Z",
      replyComments: 0,
      text: "Εκδόθηκε απόφαση για τις ασυμβατότητες οικολογικών σχημάτων που αφορούν τις δηλώσεις ΟΣΔΕ 2024. \n\nΠροσοχή στις δηλώσεις σας. Συνεργαστείτε με τα ΚΥΔ ",
      title: "Οικολογικά σχήματα: Εκδόθηκε η απόφαση για τις ασυμβατότητες",
      unreadComments: 0,
    },
  ]);

  // 2) useEffects

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      try {
        animateOnFocus();
        if (firstTime) {
          getPostsFunction();
          setfirstTime(false);
          MembershipCheckFunction();
        }

        updateFilter();

        setfilter(0);
      } catch (error) {
        Alert.alert(error);
      }
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (firstTime) return;
    if (filter === 1) {
      getPostsWithUserCommentsFunction();
    } else if (filter == 0) {
      getPostsFunction();
    } else if (filter == 2) {
      getPostsFunctionWithNotifications();
    }
    setfilterText(null);

    return;
  }, [filter]);

  useEffect(() => {
    if (firstTime) return;
    updateSearch(filterText || "");
  }, [posts]);

  // 3) Functions

  const updateFilter = async () => {
    let initialFilter = await AsyncStorage.getItem("initialFilter");
    console.log("1) Initial Filter: ", initialFilter);
    let stringToInt = parseInt(initialFilter);
    setfilter(stringToInt);
    AsyncStorage.setItem("initialFilter", "0");
  };

  const updateSearch = (search) => {
    setfilterText(search);

    try {
      let filteredPosts;
      if (search) {
        filteredPosts = posts.filter((post) =>
          post.title.toLowerCase().includes(search.toLowerCase())
        );
      } else {
        filteredPosts = posts;
      }
      setfilteredPosts(filteredPosts);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const animateOnFocus = () => {
    if (animatedViewRef.current) {
      animatedViewRef.current.animate("zoomIn", 400);
    }
    animatedPostsRefs.current.forEach((ref) => {
      if (ref) {
        ref.animate("bounceInUp", 1500);
      }
    });
  };

  const getPostsFunction = async () => {
    let MembershipCheck = await AsyncStorage.getItem("ProMembership");
    console.log("News Screen - Get Post Membership Check :", MembershipCheck);
    if (MembershipCheck !== "true") {
      return;
    }

    try {
      await setLoading(true);
      let userToken = await AsyncStorage.getItem("userToken");
      settoken(userToken);

      const response = await getPostsApi("apiUrl", userToken);

      if (response.status >= 400) {
        // Handle HTTP error status here
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      //console.log("Posts returned : ", data.data);

      setposts((prevPosts) => data?.data);

      // setfilteredPosts((prevFilteredPosts) => data?.data);

      if (filter === 2) {
        // Filter the posts to keep only those with unreadComments > 0
        const filteredData = data?.data.filter(
          (post) => post.unreadComments > 0
        );
        setfilteredPosts(filteredData);
      } else {
        setfilteredPosts(data?.data);
      }

      setshowFilters(false);
      setLoading(false);
    } catch (error) {
      console.log("Error :", error);

      Alert.alert(
        "Πρόβλημα σύνδεσης.",
        "Ο Λογαριασμός σας ήταν πολύ ώρα σε αδράνεια. Παρακαλώ συνδεθείτε ξανα.",
        [
          {
            text: "Αποσύνδεση",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );

      await setLoading(false);
    }
  };

  const getPostsFunctionWithNotifications = async () => {
    try {
      await setLoading(true);
      let userToken = await AsyncStorage.getItem("userToken");
      settoken(userToken);

      const response = await getPostsApi("apiUrl", userToken);
      const data = await response.json();

      //console.log("Posts returned : ", data.data);

      //setposts((prevPosts) => data?.data);

      // setfilteredPosts((prevFilteredPosts) => data?.data);

      // Filter the posts to keep only those with unreadComments > 0
      const filteredData = data?.data.filter((post) => post.unreadComments > 0);
      console.log("Filtered Data:", filteredData.length);
      setfilteredPosts(filteredData);

      setshowFilters(false);
      setLoading(false);
    } catch (error) {
      console.log("Error :", error);

      Alert.alert(
        "Πρόβλημα σύνδεσης.",
        "Ο Λογαριασμός σας ήταν πολύ ώρα σε αδράνεια. Παρακαλώ συνδεθείτε ξανα.",
        [
          {
            text: "Αποσύνδεση",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );

      await setLoading(false);
    }
  };

  const handleCommentPosted = async () => {
    if (filter === 1) {
      await getPostsWithUserCommentsFunction();
    } else {
      await getPostsFunction();
    }
  };

  const getPostsWithUserCommentsFunction = async () => {
    //console.log("Called 2");
    try {
      setLoading(true);
      let userInfo = await AsyncStorage.getItem("userInfo");

      let parsedUserInfo = await JSON.parse(userInfo);
      let userId = parsedUserInfo.userId;

      const response = await getPostsWithUserCommentsApi(
        "apiUrl",
        userId,
        token
      );
      const data = await response.json();

      // console.log("Commented Posts : ", data);

      setposts((prevPosts) => data?.data);
      setfilteredPosts((prevFilteredPosts) => data?.data);
      setshowFilters(false);
      setLoading(false);
    } catch (error) {
      console.log("ERROR :", error);

      await setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    getPostsFunction();
    setRefreshing(false);
  }, []);

  const MembershipCheckFunction = async () => {
    let MembershipCheck = await AsyncStorage.getItem("ProMembership");
    console.log("News Screen - Membership Check :", MembershipCheck);
    if (MembershipCheck == "true") {
      setisProMember(true);
    } else {
      setisProMember(false);
    }
  };

  return (
    <>
      <AnimatedView ref={animatedViewRef} style={{ flex: 1 }}>
        <SafeAreaView>
          {/* Header */}
          <View className="flex-row justify-between items-center ">
            <ScreenTitle
              title="Ενημέρωση"
              back={true}
              navigation={navigation}
            />
          </View>

          {/* Search Bar */}
          <View>
            <SearchBar
              lightTheme={true}
              placeholder="Αναζήτηση..."
              //platform="ios"
              clearIcon={true}
              loadingProps={true}
              containerStyle={styles.SearchStyleOut}
              inputContainerStyle={styles.SearchStyleIn}
              onChangeText={updateSearch}
              value={filterText}
            />
          </View>

          {/* Posts List */}
          {!loading ? (
            <View className="h-full">
              {/* Whole content */}
              <ScrollView
                contentContainerStyle={{ paddingBottom: 300 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              >
                {/* Title before articles */}
                <View className=" my-2  pr-3">
                  <View className="flex-row justify-between">
                    <View className="px-3 flex-row items-center">
                      <AntDesign
                        name="inbox"
                        size={24}
                        style={{ color: colors.Main[500] }}
                      />
                      <Text className="text-lg font-semibold  ml-2 ">
                        Πρόσφατα άρθρα
                      </Text>
                    </View>
                    {/* Show filter button */}
                    <TouchableOpacity
                      className=" p-2 rounded-xl flex-row justify-center items-center shadow-sm"
                      style={{ backgroundColor: colors.Main[500] }}
                      onPress={() => {
                        setshowFilters(!showFilters);
                      }}
                    >
                      {showFilters ? (
                        <AntDesign
                          name="close"
                          size={24}
                          style={{ color: "#fff" }}
                        />
                      ) : (
                        <Ionicons
                          name="options"
                          size={24}
                          style={{ color: "#fff" }}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Filters area */}
                {showFilters && (
                  <View className="px-3 mt-2 mb-4">
                    <View className="bg-white shadow-sm rounded-md py-3 px-3">
                      <Text className="text-base font-semibold">
                        Φίλτραρισμα άρθρων
                      </Text>

                      <CheckBox
                        checked={filter === 0}
                        onPress={() => setfilter(0)}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        title="Όλα τα άρθρα"
                        textStyle={{ fontWeight: "400", fontSize: 16 }}
                        containerStyle={{ margin: 0 }}
                        checkedColor={colors.Second[500]}
                        uncheckedColor={colors.Main[500]}
                      />
                      <CheckBox
                        checked={filter === 1}
                        onPress={() => setfilter(1)}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        title="Άρθρα που έχω σχολιάσει"
                        textStyle={{ fontWeight: "400", fontSize: 16 }}
                        containerStyle={{ margin: 0 }}
                        checkedColor={colors.Second[500]}
                        uncheckedColor={colors.Main[500]}
                      />
                      {isProMember && (
                        <CheckBox
                          checked={filter === 2}
                          onPress={() => setfilter(2)}
                          checkedIcon="dot-circle-o"
                          uncheckedIcon="circle-o"
                          title="Ειδοποιήσεις σε άρθρα"
                          textStyle={{ fontWeight: "400", fontSize: 16 }}
                          containerStyle={{ margin: 0 }}
                          checkedColor={colors.Second[500]}
                          uncheckedColor={colors.Main[500]}
                        />
                      )}
                    </View>
                  </View>
                )}

                {/* Show All Button */}
                {filter === 2 && (
                  <TouchableOpacity
                    className=" p-2 m-3 rounded-full text-center"
                    style={{ backgroundColor: colors.Second[500] }}
                    onPress={() => {
                      setfilter(0);
                      AsyncStorage.setItem("initialFilter", "0");
                    }}
                  >
                    <Text className="text-lg text-center font-semibold text-white">
                      Δείξε όλα τα άρθρα
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Single article */}

                {!isProMember ? (
                  <>
                    <View className="px-4 my-2">
                      <Text className="font-semibold text-base">
                        * Έχετε συνδεθεί ως επισκέπτης.
                      </Text>
                      <Text className="text-xs font-medium text-gray-600">
                        Μην χάνετε χρόνο! Αναβαθμίστε τώρα την εφαρμογή σε
                        Premium για να έχετε πρόσβαση σε καθημερινή ενημέρωση
                        των άρθρων.
                      </Text>
                      <TouchableOpacity
                        className="py-2 mt-2 rounded-full"
                        style={{ backgroundColor: colors.Second[500] }}
                      >
                        <Text
                          className="text-center text-white font-semibold text-base"
                          onPress={() => navigation.navigate("Subscription")}
                        >
                          Αναβάθμιση σε Premium
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {trialPeriodContent?.map((e, index) => {
                      return (
                        <AnimatedView
                          ref={(ref) =>
                            (animatedPostsRefs.current[index] = ref)
                          }
                          key={index + "Posts"}
                          animation="bounceInUp"
                          duration={1500}
                        >
                          <TrialPosts
                            data={e}
                            index={index}
                            onCommentPosted={handleCommentPosted}
                          />
                        </AnimatedView>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {filteredPosts !== null &&
                      filteredPosts?.map((e, index) => {
                        return (
                          <AnimatedView
                            ref={(ref) =>
                              (animatedPostsRefs.current[index] = ref)
                            }
                            key={index + "Posts"}
                            animation="bounceInUp"
                            duration={1500}
                          >
                            <Posts
                              data={e}
                              index={index}
                              onCommentPosted={handleCommentPosted}
                            />
                          </AnimatedView>
                        );
                      })}
                  </>
                )}
              </ScrollView>
            </View>
          ) : (
            <Loading />
          )}
        </SafeAreaView>
      </AnimatedView>
    </>
  );
};

const styles = {
  SearchStyleOut: {
    backgroundColor: "transparent",
    padding: 5,
  },
  SearchStyleIn: {
    borderRadius: 40,
    paddingHorizontal: 10,
  },
};

export default NewsScreen;
