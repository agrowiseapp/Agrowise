import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useRef, useState } from "react";
import ScreenTitle from "../components/structure/ScreenTitle";
import Posts from "../components/news/Posts";
import { SearchBar } from "@rneui/themed";
import Loading from "../components/structure/Loading";
import {
  createAnimatableComponent,
  View as AnimatableView,
} from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import colors from "../assets/Theme/colors";
import AsyncStorage from "../utils/AsyncStorage";
import { CheckBox } from "@rneui/themed";
import TrialPosts from "../components/news/TrialPosts";
import useRevenueCat from "../hooks/useRevenueCat";
import CheckIsPro from "../components/utils/CheckIsPro";
import { getPostsApi } from "../apis/PostsApi";

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
  const [refreshing, setRefreshing] = useState(false);
  const [isProMember, setisProMember] = useState(false);

  // Generate dynamic dates for hardcoded posts
  const generateTrialContent = () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return [
      {
        _id: "66a9e7b0ff9317ec7f74d5dd",
        author: "GIANNIS PEROULAKIS - (Διαχειριστής)",
        comments: 0,
        publishedAt: oneDayAgo.toISOString(),
        replyComments: 0,
        text: "Όσες κτηνοτροφικές εκμεταλλεύσεις προσβληθούν από Πανώλη με τα αντίστοιχα δικαιολογητικά που αποδεικνύουν την ύπαρξη της ασθένειας θα μπορούν να απαλλαγούν από κάποιες δεσμεύσεις για το πρόγραμμα νέων αγροτών αλλά και τα σχέδια βελτίωσης (ανωτέρα βία).",
        title: "Πανώλη και προγράμματα Νέων Αγροτών - Σχέδια Βελτίωσης",
        unreadComments: 0,
      },
      {
        _id: "66a7a7925e5d060e92064b1a",
        author: "GIANNIS PEROULAKIS - (Διαχειριστής)",
        comments: 0,
        publishedAt: fiveDaysAgo.toISOString(),
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
        publishedAt: oneWeekAgo.toISOString(),
        replyComments: 0,
        text: "Εκδόθηκε απόφαση για τις ασυμβατότητες οικολογικών σχημάτων που αφορούν τις δηλώσεις ΟΣΔΕ 2024. \n\nΠροσοχή στις δηλώσεις σας. Συνεργαστείτε με τα ΚΥΔ ",
        title: "Οικολογικά σχήματα: Εκδόθηκε η απόφαση για τις ασυμβατότητες",
        unreadComments: 0,
      },
    ];
  };

  const [trialPeriodContent, settrialPeriodContent] = useState(generateTrialContent());

  // 2) useEffects

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      try {
        animateOnFocus();
        if (firstTime) {
          MembershipCheckFunction();
          getPostsFunction();
          setfirstTime(false);
        }

        updateFilter();

        setfilter(0);
      } catch (error) {
        Alert.alert(error);
      }
    });

    return unsubscribe;
  }, [navigation]);

  // Trigger posts fetch when membership status changes
  useEffect(() => {
    if (!firstTime) {
      // Only call if not first time (to avoid double calls)
      getPostsFunction();
    }
  }, [isProMember]);

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
    if (MembershipCheck !== "true") {
      // For demo users, refresh the hardcoded posts with new dates
      settrialPeriodContent(generateTrialContent());
      return;
    }

    try {
      await setLoading(true);
      let userToken = await AsyncStorage.getItem("userToken");
      settoken(userToken);

      const response = await getPostsApi("apiUrl", userToken);

      if (response.status >= 400) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      setposts((prevPosts) => data?.data);

      if (filter === 2) {
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

      const filteredData = data?.data.filter((post) => post.unreadComments > 0);
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

      setposts((prevPosts) => data?.data);
      setfilteredPosts((prevFilteredPosts) => data?.data);
      setshowFilters(false);
      setLoading(false);
    } catch (error) {
      console.log("ERROR :", error);

      await setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await getPostsFunction();
    setRefreshing(false);
  }, []);

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
      <AnimatedView ref={animatedViewRef} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
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
            <View style={styles.fullHeight}>
              {/* Whole content */}
              <ScrollView
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              >
                {/* Title before articles */}
                <View style={styles.titleContainer}>
                  <View style={styles.titleInnerContainer}>
                    <View style={styles.titleTextWrapper}>
                      <AntDesign
                        name="inbox"
                        size={24}
                        style={{ color: colors.Main[500] }}
                      />
                      <Text style={styles.titleText}>Πρόσφατα άρθρα</Text>
                    </View>
                    {/* Show filter button */}
                    <TouchableOpacity
                      style={[
                        styles.filterButton,
                        { backgroundColor: colors.Main[500] },
                      ]}
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
                  <View style={styles.filtersArea}>
                    <View style={styles.filtersBox}>
                      <Text style={styles.filterTitle}>Φίλτραρισμα άρθρων</Text>
                      <CheckBox
                        checked={filter === 0}
                        onPress={() => setfilter(0)}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        title="Όλα τα άρθρα"
                        textStyle={styles.checkboxTextStyle}
                        containerStyle={styles.checkboxContainer}
                        checkedColor={colors.Second[500]}
                        uncheckedColor={colors.Main[500]}
                      />
                      <CheckBox
                        checked={filter === 1}
                        onPress={() => setfilter(1)}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        title="Άρθρα που έχω σχολιάσει"
                        textStyle={styles.checkboxTextStyle}
                        containerStyle={styles.checkboxContainer}
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
                          textStyle={styles.checkboxTextStyle}
                          containerStyle={styles.checkboxContainer}
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
                    style={[
                      styles.showAllButton,
                      { backgroundColor: colors.Second[500] },
                    ]}
                    onPress={() => {
                      setfilter(0);
                      AsyncStorage.setItem("initialFilter", "0");
                    }}
                  >
                    <Text style={styles.showAllButtonText}>
                      Δείξε όλα τα άρθρα
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Single article */}
                {!isProMember ? (
                  <>
                    <View style={styles.guestUserContainer}>
                      <Text style={styles.guestTextBold}>
                        * Έχετε συνδεθεί ως επισκέπτης.
                      </Text>
                      <Text style={styles.guestTextNormal}>
                        Βλέπετε τα 3 πιο πρόσφατα άρθρα. Αναβαθμίστε τώρα την εφαρμογή σε
                        Premium για να έχετε πρόσβαση σε όλα τα άρθρα και τις λειτουργίες.
                      </Text>
                      <TouchableOpacity style={styles.upgradeButton}>
                        <Text
                          style={styles.upgradeButtonText}
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

// Define the StyleSheet with all the converted styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  SearchStyleOut: {
    backgroundColor: "transparent",
    padding: 5,
  },
  SearchStyleIn: {
    borderRadius: 40,
    paddingHorizontal: 10,
  },
  fullHeight: {
    height: "100%",
  },
  contentContainer: {
    paddingBottom: 300,
  },
  titleContainer: {
    marginVertical: 8,
    paddingRight: 12,
  },
  titleInnerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleTextWrapper: {
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  filterButton: {
    padding: 8,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filtersArea: {
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  filtersBox: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  checkboxTextStyle: {
    fontWeight: "400",
    fontSize: 16,
  },
  checkboxContainer: {
    margin: 0,
  },
  showAllButton: {
    padding: 8,
    margin: 12,
    borderRadius: 9999,
  },
  showAllButtonText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
    color: "white",
  },
  guestUserContainer: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  guestTextBold: {
    fontWeight: "600",
    fontSize: 16,
  },
  guestTextNormal: {
    fontSize: 12,
    fontWeight: "500",
    color: "gray",
  },
  upgradeButton: {
    paddingVertical: 8,
    marginTop: 8,
    borderRadius: 9999,
    backgroundColor: colors.Second[500],
  },
  upgradeButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default NewsScreen;
