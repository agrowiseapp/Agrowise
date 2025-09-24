import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { Avatar } from "@rneui/base/dist/Avatar/Avatar";
import React, { useEffect, useState } from "react";
import DateSinceNow from "../../utils/DateSinceNow";
import colors from "../../../assets/Theme/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import checkForBadWordsAndAlert from "../../utils/checkForBadWordsAndAlert";
import Avatar1 from "../../../assets/images/avatar1.png";
import Avatar2 from "../../../assets/images/avatar2.png";
import Avatar3 from "../../../assets/images/avatar3.png";
import Avatar4 from "../../../assets/images/avatar4.png";
import Avatar5 from "../../../assets/images/avatar5.png";
import Avatar6 from "../../../assets/images/avatar6.png";
import Avatar7 from "../../../assets/images/avatar7.png";
import Avatar8 from "../../../assets/images/avatar8.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  deleteSpecificCommentApi,
  deleteSpecificReplyCommentApi,
  replyCommentApi,
  reportCommentApi,
  reportReplyApi,
} from "../../../apis/CommentsApi";
import Loading from "../../structure/Loading";
import { CheckBox } from "@rneui/base";

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

const SingleComment = ({
  content,
  getSpecificPostFunction,
  loadingSendMessage,
}) => {
  // 1) Data
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [visibleDialog2, setVisibleDialog2] = useState(false);
  const [deleteIsPressed, setdeleteIsPressed] = useState(false);
  const [reportIsPressed, setreportIsPressed] = useState(false);
  const [reportReason, setreportReason] = useState("");
  const [newComment, setnewComment] = useState("");
  const [replies, setreplies] = useState(null);
  const [postCommentLoad, setpostCommentLoad] = useState(false);
  const [replyAction, setreplyAction] = useState(0);
  const [selectedReply, setselectedReply] = useState(null);

  // 3) Functions
  useEffect(() => {
    //console.log("Content cjanges:", content);
    setreplies(content?.replies);
    return;
  }, [content]);

  const ReplyComment = ({ content }) => {
    return (
      <TouchableOpacity
        className="flex-col mb-3  w-full  rounded-lg pl-5"
        onPress={() => {
          if (!content.reported) {
            setVisibleDialog(true);
            setselectedReply(content);
          }
        }}
      >
        <View
          className="shadow-sm  border border-gray-300 bg-gray-200 px-3 py-2 rounded-lg"
          style={[
            content.isMine && {
              borderLeftWidth: 10,
              borderLeftColor: colors.Second[500],
            },
            content.reported && {
              backgroundColor: "white",
            },
          ]}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center">
            {/* Profile */}
            <View className="flex-row items-center flex-wrap">
              {content.authorAvatar !== null && !content.reported && (
                <Image
                  source={getAvatarSource(content?.authorAvatar)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 20,
                    backgroundColor: "#fff",
                  }}
                />
              )}
              <Text
                className="font-bold text-xs ml-2"
                style={
                  content.reported && {
                    color: "lightgray",
                  }
                }
              >
                {content.author !== undefined && content.author}
                {content.firstName !== undefined && content.firstName}
              </Text>
            </View>
          </View>

          {/* content */}
          <Text
            className="text-base"
            style={
              content.reported && {
                color: "lightgray",
              }
            }
          >
            {content.reported ? content.reportedReason : content.content}
          </Text>

          {/* Date */}
          <View className="mt-1">
            <Text
              className="text-gray-500 text-right "
              style={
                content.reported && {
                  color: "lightgray",
                }
              }
            >
              {content.publishedAt != null && (
                <DateSinceNow date={content.publishedAt} />
              )}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const replyToCommentFunction = async () => {
    try {
      if (newComment == null || newComment == "") {
        return;
      }

      // Filter the comment for bad words
      const hasBadWords = checkForBadWordsAndAlert(newComment);

      if (hasBadWords) {
        // The comment contains bad words, handle the situation accordingly
        console.log("Comment contains bad words, please revise it.");
        Alert.alert("Το σχόλιο περιέχει μη επιτρεπτό κείμενο!");
        return;
      }

      setpostCommentLoad(true);

      let userToken = await AsyncStorage.getItem("userToken");
      let userInfo = await AsyncStorage.getItem("userInfo");
      let parsedUserInfo = await JSON.parse(userInfo);

      let fullName = "";
      if (parsedUserInfo.isAdmin) {
        fullName =
          parsedUserInfo.firstName +
          " " +
          parsedUserInfo.lastName +
          " - (Διαχειριστής)";
      } else {
        fullName = parsedUserInfo.firstName + " " + parsedUserInfo.lastName;
      }

      let bodyObject = {
        commentId: content._id,
        authorId: parsedUserInfo.userId,
        author: fullName,
        content: newComment,
        isMine: true,
        authorAvatar: parsedUserInfo.avatar,
      };

      const response = await replyCommentApi("apiUrl", bodyObject, userToken);
      const data = await response.json();

      //console.log("Data :", data);

      if (data.resultCode == 0) {
        await setnewComment(null);

        console.log("reply posted....");
        getSpecificPostFunction();
        setVisibleDialog(false);
      }
      setpostCommentLoad(false);
    } catch (error) {
      console.log("Error :", error);
    }
  };

  const deleteCommentFunction = async () => {
    try {
      setpostCommentLoad(true);

      let userToken = await AsyncStorage.getItem("userToken");

      const response = await deleteSpecificCommentApi(
        "apiUrl",
        content._id,
        userToken
      );
      const data = await response.json();

      //console.log("DATA :", data.data);

      if (data?.resultCode === 0) {
        getSpecificPostFunction();
      }

      setpostCommentLoad(true);
    } catch (error) {
      console.log("ERROR :", error);
    }
  };

  const deleteReplyFunction = async () => {
    try {
      setpostCommentLoad(true);

      let userToken = await AsyncStorage.getItem("userToken");

      const response = await deleteSpecificReplyCommentApi(
        "apiUrl",
        content._id,
        selectedReply._id,
        userToken
      );
      const data = await response.json();

      //console.log("DATA :", data.data);

      if (data?.resultCode === 0) {
        getSpecificPostFunction();
      }

      setpostCommentLoad(true);
    } catch (error) {
      console.log("ERROR :", error);
    }
  };

  const handleReportComment = () => {
    setreportIsPressed(true);
    // Alert.alert(
    //   "Αναφορά σχόλιου",
    //   "Είσαι σίγουρος ότι θέλεις να αναφέρεις αυτό το σχόλιο?",
    //   [
    //     { text: "Άκυρο", style: "cancel" },
    //     {
    //       text: "Αναφορά",
    //       onPress: () => {
    //         // You can handle the reporting logic here
    //         // For this example, let's set a 'reported' flag for the comment
    //         //setCommentReported(true);
    //         // You can also implement server-side reporting here if needed
    //         // Make an API call to report the comment to your server
    //       },
    //     },
    //   ]
    // );
  };

  const reportCommentFunction = async () => {
    if (reportReason == "") {
      return;
    }
    try {
      setpostCommentLoad(true);

      let userToken = await AsyncStorage.getItem("userToken");

      const bodyObject = {
        commentId: content._id,
        reportedReason: reportReason,
        reported: true,
      };

      const response = await reportCommentApi("apiUrl", bodyObject, userToken);
      const data = await response.json();

      console.log("DATA :", data.resultCode);

      if (data?.resultCode === 0) {
        getSpecificPostFunction();
      }

      setpostCommentLoad(false);
    } catch (error) {
      console.log("ERROR :", error);
      setpostCommentLoad(false);
    }
  };

  const reportReplyFunction = async () => {
    if (reportReason == "") {
      return;
    }
    try {
      setpostCommentLoad(true);

      let userToken = await AsyncStorage.getItem("userToken");

      const bodyObject = {
        commentId: content._id,
        replyId: selectedReply._id,
        reportedReason: reportReason,
        reported: true,
      };

      const response = await reportReplyApi("apiUrl", bodyObject, userToken);
      const data = await response.json();

      console.log("DATA :", data.resultCode);

      if (data?.resultCode === 0) {
        getSpecificPostFunction();
      }

      setpostCommentLoad(false);
    } catch (error) {
      console.log("ERROR :", error);
      setpostCommentLoad(false);
    }
  };

  const getAvatarSource = (avatarId) => {
    return avatars[avatarId] || avatars[1];
  };

  return (
    <>
      <TouchableOpacity
        className="flex-col mb-3  w-full shadow-sm border border-gray-300 rounded-lg"
        style={
          content.isMine && {
            borderLeftWidth: 10,
            borderLeftColor: colors.Second[500],
          }
        }
        onPress={() => {
          if (!content.reported) setVisibleDialog(true);
        }}
      >
        <View
          className=" bg-gray-200 px-3 py-2 rounded-lg"
          style={
            content.reported && {
              backgroundColor: "white",
            }
          }
        >
          {/* Header */}
          <View className="flex-row justify-between items-center">
            {/* Profile */}
            <View className="flex-row items-center flex-wrap">
              {content.authorAvatar !== null && !content.reported && (
                <Image
                  source={getAvatarSource(content?.authorAvatar)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 20,
                    backgroundColor: "#fff",
                  }}
                />
              )}
              <Text
                className="font-bold text-sm ml-2"
                style={
                  content.reported && {
                    color: "lightgray",
                  }
                }
              >
                {content.author !== undefined && content.author}
                {content.firstName !== undefined && content.firstName}
              </Text>
            </View>
          </View>

          {/* content */}

          <Text
            className="text-base"
            style={
              content.reported && {
                color: "lightgray",
              }
            }
          >
            {content.reported ? content.reportedReason : content.content}
          </Text>

          {/* Date */}
          <View className="mt-2 flex-row justify-between items-center">
            {/* Icons for Delete - Response */}
            <View className="flex-row items-center">
              <MaterialIcons name="more" size={18} color="gray" />
              <Text
                className="text-gray-500 text-right ml-2"
                style={
                  content.reported && {
                    color: "lightgray",
                  }
                }
              >
                Ενέργειες
              </Text>
            </View>
            <Text
              className="text-gray-500 text-right "
              style={
                content.reported && {
                  color: "lightgray",
                }
              }
            >
              {content.publishedAt != null && (
                <DateSinceNow date={content.publishedAt} />
              )}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {replies !== null &&
        replies !== undefined &&
        replies.map((reply, index) => {
          return <ReplyComment content={reply} key={"reply_" + index} />;
        })}

      {/* Dialog 1 */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={visibleDialog}
        onRequestClose={() => {
          setVisibleDialog(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : null}
          style={{ flex: 1 }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {/* Τίτλος */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}
                >
                  Επιλεγμένο σχόλιο
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setVisibleDialog(false);
                    setreportIsPressed(false);
                    setdeleteIsPressed(false);
                    setreportReason("");
                  }}
                >
                  <MaterialIcons name="close" size={30} color="gray" />
                </TouchableOpacity>
              </View>

              {/* Περιεχόμενο σχόλιου */}
              <Text style={{ fontSize: 16, marginBottom: 10, color: "gray" }}>
                {content.content}
              </Text>

              {/* Ενέργειες */}
              {postCommentLoad ? (
                <View className="mb-10">
                  <Loading />
                </View>
              ) : (
                <View>
                  {/* Respond */}
                  {!deleteIsPressed && !reportIsPressed && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 10,
                        marginBottom: 20,
                      }}
                    >
                      <TextInput
                        style={{
                          padding: 10,
                          borderRadius: 20,
                          flex: 1,
                          marginRight: 10,
                        }}
                        className="bg-gray-200"
                        onChangeText={setnewComment}
                        value={newComment}
                        placeholder="Απάντηση στο σχόλιο.."
                        placeholderTextColor="gray" // Placeholder color
                      />
                      <TouchableOpacity
                        style={{
                          backgroundColor: colors.Main[600],
                          paddingVertical: 8,
                          paddingHorizontal: 15,
                          borderRadius: 20,
                        }}
                        onPress={replyToCommentFunction}
                      >
                        <Feather name="send" size={22} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Delete */}
                  {content.isMine && !deleteIsPressed ? (
                    <TouchableOpacity
                      style={{
                        backgroundColor: "red",
                        padding: 8,
                        borderRadius: 4,
                        marginTop: 10,
                      }}
                      onPress={() => setdeleteIsPressed(true)}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 16,
                          color: "white",
                        }}
                      >
                        Διαγραφή σχόλιου
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    content.isMine && (
                      <>
                        <Text style={{ marginVertical: 5, fontSize: 16 }}>
                          Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το
                          σχόλιο;
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              backgroundColor: "gray",
                              padding: 8,
                              borderRadius: 4,
                              marginTop: 10,
                              flex: 1,
                              marginRight: 5,
                            }}
                            onPress={() => setdeleteIsPressed(false)}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 16,
                                color: "white",
                              }}
                            >
                              Άκυρο
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              backgroundColor: "red",
                              padding: 8,
                              borderRadius: 4,
                              marginTop: 10,
                              flex: 1,
                              marginLeft: 5,
                            }}
                            onPress={deleteCommentFunction}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 16,
                                color: "white",
                              }}
                            >
                              Διαγραφή
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )
                  )}

                  {/* Report */}
                  {!content.isMine && !reportIsPressed && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: "gray",
                        padding: 8,
                        borderRadius: 4,
                        marginTop: 10,
                      }}
                      onPress={handleReportComment}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 16,
                          color: "white",
                        }}
                      >
                        Αναφορά σχόλιου
                      </Text>
                    </TouchableOpacity>
                  )}

                  {!content.isMine && reportIsPressed && (
                    <>
                      {/* Text */}
                      <Text style={{ marginVertical: 5, fontSize: 16 }}>
                        Παρακαλώ επιλέξτε τον λόγο που θέλετε να αναφέρετε το
                        σχόλιο.
                      </Text>

                      {/* reasons for report */}
                      <View>
                        <TouchableOpacity
                          style={{ flexDirection: "row", alignItems: "center" }}
                          onPress={() => {
                            setreportReason("Προσβλητικό περιεχόμενο");
                          }}
                        >
                          <CheckBox
                            checked={reportReason == "Προσβλητικό περιεχόμενο"}
                            checkedColor={colors.Main[500]}
                          />
                          <Text>Προσβλητικό περιεχόμενο</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: -15,
                          }}
                          onPress={() => {
                            setreportReason("Μη επιτρεπτή χρήση γλώσσας");
                          }}
                        >
                          <CheckBox
                            checked={
                              reportReason == "Μη επιτρεπτή χρήση γλώσσας"
                            }
                            checkedColor={colors.Main[500]}
                          />
                          <Text>Μη επιτρεπτή χρήση γλώσσας</Text>
                        </TouchableOpacity>

                        <View className="mt-2 mb-5">
                          <Text>Άλλος λόγος :</Text>
                          <TextInput
                            className="bg-gray-200 p-3 rounded-full mt-2"
                            onChangeText={setreportReason}
                            value={reportReason}
                            placeholder="Λόγος αναφοράς.."
                            placeholderTextColor="gray" // Placeholder color
                          />
                        </View>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: "gray",
                            padding: 8,
                            borderRadius: 4,
                            marginTop: 10,
                            flex: 1,
                            marginRight: 5,
                          }}
                          onPress={() => setreportIsPressed(false)}
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              fontSize: 16,
                              color: "white",
                            }}
                          >
                            Άκυρο
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "red",
                            padding: 8,
                            borderRadius: 4,
                            marginTop: 10,
                            flex: 1,
                            marginLeft: 5,
                          }}
                          disabled={reportReason == "" ? true : false}
                          onPress={reportCommentFunction}
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              fontSize: 16,
                              color: "white",
                            }}
                          >
                            Αναφορά
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Dialog  2*/}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visibleDialog2}
        onRequestClose={() => {
          setVisibleDialog2(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Τίτλος */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}
              >
                Επιλεγμένη απάντηση
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setVisibleDialog2(false);
                }}
              >
                <MaterialIcons name="close" size={30} color="gray" />
              </TouchableOpacity>
            </View>

            {/* Περιεχόμενο σχόλιου */}
            <Text style={{ fontSize: 16, marginBottom: 10, color: "gray" }}>
              {selectedReply?.content}
            </Text>

            {/* Ενέργειες */}
            {postCommentLoad ? (
              <View className="mb-10">
                <Loading />
              </View>
            ) : (
              <View>
                {/* Delete */}
                {selectedReply?.isMine && (
                  <>
                    <Text style={{ marginVertical: 5, fontSize: 16 }}>
                      Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το σχόλιο;
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          backgroundColor: "gray",
                          padding: 8,
                          borderRadius: 4,
                          marginTop: 10,
                          flex: 1,
                          marginRight: 5,
                        }}
                        onPress={() => setVisibleDialog2(false)}
                      >
                        <Text
                          style={{
                            textAlign: "center",
                            fontSize: 16,
                            color: "white",
                          }}
                        >
                          Άκυρο
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "red",
                          padding: 8,
                          borderRadius: 4,
                          marginTop: 10,
                          flex: 1,
                          marginLeft: 5,
                        }}
                        onPress={deleteReplyFunction}
                      >
                        <Text
                          style={{
                            textAlign: "center",
                            fontSize: 16,
                            color: "white",
                          }}
                        >
                          Διαγραφή
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {!selectedReply?.isMine && (
                  <>
                    {reportIsPressed ? (
                      <>
                        {/* Text */}
                        <Text style={{ marginVertical: 5, fontSize: 16 }}>
                          Παρακαλώ επιλέξτε τον λόγο που θέλετε να αναφέρετε το
                          σχόλιο.
                        </Text>

                        {/* reasons for report */}
                        <View>
                          <TouchableOpacity
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                            onPress={() => {
                              setreportReason("Προσβλητικό περιεχόμενο");
                            }}
                          >
                            <CheckBox
                              checked={
                                reportReason == "Προσβλητικό περιεχόμενο"
                              }
                              checkedColor={colors.Main[500]}
                            />
                            <Text>Προσβλητικό περιεχόμενο</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginTop: -15,
                            }}
                            onPress={() => {
                              setreportReason("Μη επιτρεπτή χρήση γλώσσας");
                            }}
                          >
                            <CheckBox
                              checked={
                                reportReason == "Μη επιτρεπτή χρήση γλώσσας"
                              }
                              checkedColor={colors.Main[500]}
                            />
                            <Text>Μη επιτρεπτή χρήση γλώσσας</Text>
                          </TouchableOpacity>

                          <View className="mt-2 mb-5">
                            <Text>Άλλος λόγος :</Text>
                            <TextInput
                              className="bg-gray-200 p-3 rounded-full mt-2"
                              onChangeText={setreportReason}
                              value={reportReason}
                              placeholder="Λόγος αναφοράς.."
                              placeholderTextColor="gray" // Placeholder color
                            />
                          </View>
                        </View>

                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              backgroundColor: "gray",
                              padding: 8,
                              borderRadius: 4,
                              marginTop: 10,
                              flex: 1,
                              marginRight: 5,
                            }}
                            onPress={() => setreportIsPressed(false)}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 16,
                                color: "white",
                              }}
                            >
                              Άκυρο
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              backgroundColor: "red",
                              padding: 8,
                              borderRadius: 4,
                              marginTop: 10,
                              flex: 1,
                              marginLeft: 5,
                            }}
                            disabled={reportReason == "" ? true : false}
                            onPress={reportReplyFunction}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontSize: 16,
                                color: "white",
                              }}
                            >
                              Αναφορά
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={{
                          backgroundColor: "gray",
                          padding: 8,
                          borderRadius: 4,
                          marginTop: 10,
                        }}
                        onPress={handleReportComment}
                      >
                        <Text
                          style={{
                            textAlign: "center",
                            fontSize: 16,
                            color: "white",
                          }}
                        >
                          Αναφορά σχόλιου
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
  },
  modalView: {
    margin: 5,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
});

export default SingleComment;
