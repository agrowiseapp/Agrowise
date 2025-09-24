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
import SimpleIcons from "../../icons/SimpleIcons";
import checkForBadWordsAndAlert from "../../utils/checkForBadWordsAndAlert";
import Avatar1 from "../../../assets/images/avatar1.png";
import Avatar2 from "../../../assets/images/avatar2.png";
import Avatar3 from "../../../assets/images/avatar3.png";
import Avatar4 from "../../../assets/images/avatar4.png";
import Avatar5 from "../../../assets/images/avatar5.png";
import Avatar6 from "../../../assets/images/avatar6.png";
import Avatar7 from "../../../assets/images/avatar7.png";
import Avatar8 from "../../../assets/images/avatar8.png";
import AsyncStorage from "../../../utils/AsyncStorage";
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
    setreplies(content?.replies);
    return;
  }, [content]);

  const ReplyComment = ({ content }) => {
    return (
      <TouchableOpacity
        style={styles.replyCommentContainer}
        onPress={() => {
          if (!content.reported) {
            setVisibleDialog2(true);
            setselectedReply(content);
          }
        }}
      >
        <View
          style={[
            styles.replyCommentWrapper,
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
          <View style={styles.header}>
            {/* Profile */}
            <View style={styles.profileContainer}>
              {content.authorAvatar !== null && !content.reported && (
                <Image
                  source={getAvatarSource(
                    content?.authorAvatar,
                    content?.authorProfilePicture
                  )}
                  style={styles.avatar}
                />
              )}
              <Text
                style={[
                  styles.replyAuthorText,
                  content.reported && styles.reportedText,
                ]}
              >
                {content.author !== undefined && content.author}
                {content.firstName !== undefined && content.firstName}
              </Text>
            </View>
          </View>

          {/* content */}
          <Text
            style={[
              styles.replyContent,
              content.reported && styles.reportedText,
            ]}
          >
            {content.reported ? content.reportedReason : content.content}
          </Text>

          {/* Date */}
          <View style={styles.replyDateWrapper}>
            <Text
              style={[
                styles.replyDateText,
                content.reported && styles.reportedText,
              ]}
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

      if (data.resultCode == 0) {
        await setnewComment(null);
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

      if (data?.resultCode === 0) {
        getSpecificPostFunction();
      }

      setpostCommentLoad(false);
    } catch (error) {
      console.log("ERROR :", error);
      setpostCommentLoad(false);
    }
  };

  const getAvatarSource = (avatarId, profilePicture) => {
    // If user has Google profile picture, use it
    if (profilePicture) {
      return { uri: profilePicture };
    }
    // Otherwise, fall back to numbered avatar
    return avatars[avatarId] || avatars[1];
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.commentContainer,
          content.isMine && styles.myComment,
          content.reported && styles.reportedComment,
        ]}
        onPress={() => {
          if (!content.reported) setVisibleDialog(true);
        }}
      >
        <View style={styles.commentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            {/* Profile */}
            <View style={styles.profileContainer}>
              {content.authorAvatar !== null && !content.reported && (
                <Image
                  source={getAvatarSource(
                    content?.authorAvatar,
                    content?.authorProfilePicture
                  )}
                  style={styles.avatar}
                />
              )}
              <Text
                style={[
                  styles.authorText,
                  content.reported && styles.reportedText,
                ]}
              >
                {content.author !== undefined && content.author}
                {content.firstName !== undefined && content.firstName}
              </Text>
            </View>
          </View>

          {/* content */}
          <Text
            style={[styles.content, content.reported && styles.reportedText]}
          >
            {content.reported ? content.reportedReason : content.content}
          </Text>

          {/* Date */}
          <View style={styles.dateContainer}>
            {/* Icons for Delete - Response */}
            <View style={styles.actionContainer}>
              <SimpleIcons name="more-horizontal" size={18} color="gray" />
              <Text
                style={[
                  styles.actionText,
                  content.reported && styles.reportedText,
                ]}
              >
                Ενέργειες
              </Text>
            </View>
            <Text
              style={[styles.dateText, content.reported && styles.reportedText]}
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
                  width: "100%",
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
                  <SimpleIcons name="close" size={30} color="gray" />
                </TouchableOpacity>
              </View>

              {/* Περιεχόμενο σχόλιου */}
              <Text style={{ fontSize: 16, marginBottom: 10, color: "gray" }}>
                {content.content}
              </Text>

              {/* Ενέργειες */}
              {postCommentLoad ? (
                <View style={styles.modalLoadingContainer}>
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
                        width: "100%",
                      }}
                    >
                      <TextInput
                        style={[styles.replyInput, styles.shadow]}
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
                        <SimpleIcons name="send" size={22} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Delete */}
                  {content.isMine && !deleteIsPressed ? (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => setdeleteIsPressed(true)}
                    >
                      <Text style={styles.deleteButtonText}>
                        Διαγραφή σχόλιου
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    content.isMine && (
                      <>
                        <Text style={styles.confirmText}>
                          Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το
                          σχόλιο;
                        </Text>
                        <View style={styles.confirmButtonsContainer}>
                          <TouchableOpacity
                            style={[
                              styles.confirmButton,
                              styles.cancelConfirmButton,
                            ]}
                            onPress={() => setdeleteIsPressed(false)}
                          >
                            <Text style={styles.deleteButtonText}>Άκυρο</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.confirmButton,
                              styles.deleteConfirmButton,
                            ]}
                            onPress={deleteCommentFunction}
                          >
                            <Text style={styles.deleteButtonText}>
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
                      style={styles.reportButton}
                      onPress={handleReportComment}
                    >
                      <Text style={styles.reportButtonText}>
                        Αναφορά σχόλιου
                      </Text>
                    </TouchableOpacity>
                  )}

                  {!content.isMine && reportIsPressed && (
                    <>
                      {/* Text */}
                      <Text style={styles.confirmText}>
                        Παρακαλώ επιλέξτε τον λόγο που θέλετε να αναφέρετε το
                        σχόλιο.
                      </Text>

                      {/* reasons for report */}
                      <View>
                        <TouchableOpacity
                          style={styles.checkBoxContainer}
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
                          style={styles.checkBoxContainer}
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

                        <View style={styles.otherReasonContainer}>
                          <Text>Άλλος λόγος :</Text>
                          <TextInput
                            style={styles.reportInput}
                            onChangeText={setreportReason}
                            value={reportReason}
                            placeholder="Λόγος αναφοράς.."
                            placeholderTextColor="gray"
                          />
                        </View>
                      </View>

                      <View style={styles.confirmButtonsContainer}>
                        <TouchableOpacity
                          style={[
                            styles.confirmButton,
                            styles.cancelConfirmButton,
                          ]}
                          onPress={() => setreportIsPressed(false)}
                        >
                          <Text style={styles.deleteButtonText}>Άκυρο</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.confirmButton,
                            styles.deleteConfirmButton,
                          ]}
                          disabled={reportReason == "" ? true : false}
                          onPress={reportCommentFunction}
                        >
                          <Text style={styles.deleteButtonText}>Αναφορά</Text>
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
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Επιλεγμένη απάντηση</Text>
              <TouchableOpacity
                onPress={() => {
                  setVisibleDialog2(false);
                }}
              >
                <SimpleIcons name="close" size={30} color="gray" />
              </TouchableOpacity>
            </View>

            {/* Περιεχόμενο σχόλιου */}
            <Text style={styles.modalContent}>{selectedReply?.content}</Text>

            {/* Ενέργειες */}
            {postCommentLoad ? (
              <View style={styles.modalLoadingContainer}>
                <Loading />
              </View>
            ) : (
              <View>
                {/* Delete */}
                {selectedReply?.isMine && (
                  <>
                    <Text style={styles.confirmText}>
                      Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το σχόλιο;
                    </Text>
                    <View style={styles.confirmButtonsContainer}>
                      <TouchableOpacity
                        style={[
                          styles.confirmButton,
                          styles.cancelConfirmButton,
                        ]}
                        onPress={() => setVisibleDialog2(false)}
                      >
                        <Text style={styles.deleteButtonText}>Άκυρο</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.confirmButton,
                          styles.deleteConfirmButton,
                        ]}
                        onPress={deleteReplyFunction}
                      >
                        <Text style={styles.deleteButtonText}>Διαγραφή</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {!selectedReply?.isMine && (
                  <>
                    {reportIsPressed ? (
                      <>
                        {/* Text */}
                        <Text style={styles.confirmText}>
                          Παρακαλώ επιλέξτε τον λόγο που θέλετε να αναφέρετε το
                          σχόλιο.
                        </Text>

                        {/* reasons for report */}
                        <View>
                          <TouchableOpacity
                            style={styles.checkBoxContainer}
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
                            style={styles.checkBoxContainer}
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

                          <View style={styles.otherReasonContainer}>
                            <Text>Άλλος λόγος :</Text>
                            <TextInput
                              style={styles.reportInput}
                              onChangeText={setreportReason}
                              value={reportReason}
                              placeholder="Λόγος αναφοράς.."
                              placeholderTextColor="gray"
                            />
                          </View>
                        </View>

                        <View style={styles.confirmButtonsContainer}>
                          <TouchableOpacity
                            style={[
                              styles.confirmButton,
                              styles.cancelConfirmButton,
                            ]}
                            onPress={() => setreportIsPressed(false)}
                          >
                            <Text style={styles.deleteButtonText}>Άκυρο</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.confirmButton,
                              styles.deleteConfirmButton,
                            ]}
                            onPress={reportReplyFunction}
                          >
                            <Text style={styles.deleteButtonText}>Αναφορά</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.reportButton}
                        onPress={() => setreportIsPressed(true)}
                      >
                        <Text style={styles.reportButtonText}>
                          Αναφορά απάντησης
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
  // Main Comment Styles
  commentContainer: {
    flexDirection: "column",
    marginBottom: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
  },
  commentWrapper: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  authorText: {
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
  },
  content: {
    fontSize: 16,
  },
  dateContainer: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    color: "#6b7280",
    textAlign: "right",
    marginLeft: 8,
  },
  dateText: {
    color: "#6b7280",
    textAlign: "right",
  },
  myComment: {
    borderLeftWidth: 10,
    borderLeftColor: colors.Second[500],
  },
  reportedText: {
    color: "lightgray",
  },
  reportedComment: {
    backgroundColor: "white",
  },
  // Reply Comment Styles
  replyCommentContainer: {
    flexDirection: "column",
    marginBottom: 12,
    width: "100%",
    borderRadius: 8,
    paddingLeft: 20,
  },
  replyCommentWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  replyAuthorText: {
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 8,
  },
  replyContent: {
    fontSize: 16,
  },
  replyDateWrapper: {
    marginTop: 4,
  },
  replyDateText: {
    color: "#6b7280",
    textAlign: "right",
  },
  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "flex-start",
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
  modalLoadingContainer: {
    marginBottom: 40,
  },
  replyInput: {
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  // Dialog Actions
  deleteButton: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  deleteButtonText: {
    textAlign: "center",
    fontSize: 16,
    color: "white",
  },
  confirmText: {
    marginVertical: 5,
    fontSize: 16,
  },
  confirmButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmButton: {
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
    flex: 1,
  },
  cancelConfirmButton: {
    backgroundColor: "gray",
    marginRight: 5,
  },
  deleteConfirmButton: {
    backgroundColor: "red",
    marginLeft: 5,
  },
  reportButton: {
    backgroundColor: "gray",
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  reportButtonText: {
    textAlign: "center",
    fontSize: 16,
    color: "white",
  },
  checkBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  otherReasonContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  reportInput: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 9999,
    marginTop: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalContent: {
    fontSize: 16,
    marginBottom: 10,
    color: "gray",
  },
});

export default SingleComment;
