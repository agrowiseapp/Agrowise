import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import React, { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import DateSinceNow from "../../../../utils/DateSinceNow";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSelector } from "react-redux";
import settings from "../../../../../package.json";
import {
  deleteSpecificCommentApi,
  deleteSpecificReplyCommentApi,
  replyCommentApi,
} from "../../../../api/CommentsApi";
import ReplyIcon from "@mui/icons-material/Reply";
import CloseIcon from "@mui/icons-material/Close";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import UserAvatar from "../../../../utils/UserAvatar";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "1px solid gray",
  boxShadow: 24,
  p: 5,
  borderRadius: 2,
};

function Comments({
  comments,
  update,
  updateLeft_Posts_CommentNumber,
  setTopcommentError,
}) {
  // 1) Data
  const [openModal, setOpenModal] = useState(false);
  const [openModalReply, setOpenModalReply] = useState(false);
  const User = useSelector((state) => state.User.value);
  const [selectedCommentId, setselectedCommentId] = useState("");
  const [selectedCommentReplyId, setselectedCommentReplyId] = useState("");
  const [showReply, setshowReply] = useState("");
  const [totalComments, settotalComments] = useState(0);
  const [commentError, setcommentError] = useState(false);
  const [disableButton, setdisableButton] = useState(false);

  // 2) useEffect
  useEffect(() => {
    console.log("Comments New List :", comments);
    let newArray = [];
    comments.forEach((e, index) => {
      newArray.push(false);
    });
    setshowReply(newArray);
    calculateTotalComments();

    return;
  }, []);

  // 3) Functions
  const replaceElement = (index, value) => {
    const updatedArray = showReply.map((item, idx) =>
      idx === index ? value : false
    );
    setshowReply(updatedArray);
  };

  function ReplyCommentsComponent(props) {
    // 1) Data
    const { content, author, publishedAt, isMine, _id, authorAvatar, authorProfilePicture } =
      props.message;
    const index = props.index;
    const commentId = props.commentId;

    return (
      <Grid
        container
        style={{
          borderLeft: isMine ? "4px solid #0079D3" : "4px solid #ccc",
          paddingLeft: 10,
          paddingTop: 5,
          paddingBottom: 5,
          backgroundColor: isMine ? "#F6F7F8" : "#FFFFFF",
        }}
      >
        {/* Header */}
        <Grid item xs={12} style={{ display: "flex", alignItems: "center" }}>
          <UserAvatar num={authorAvatar} w={28} h={28} profilePicture={authorProfilePicture} />
          <div
            style={{
              marginRight: 5,
              fontSize: 12,
              color: "#555555",
              fontWeight: "bold",
            }}
          >
            {author + " • "}

            <span style={{ fontSize: 12, color: "gray", fontWeight: 500 }}>
              {" "}
              <DateSinceNow date={publishedAt} />
            </span>
          </div>
        </Grid>

        {/* Content */}
        <Grid item xs={12} style={{ fontSize: 14, paddingLeft: 28 }}>
          {content}
        </Grid>

        {/*Delete */}
        <div style={{ display: "flex", marginTop: 5, alignItems: "center" }}>
          {/* Delete */}
          {/* DELETE COMMENT ALLOW ALL */}

          <Grid
            item
            xs={6}
            style={{ display: "flex", alignItems: "center" }}
            onClick={() => {
              console.log("Comment ID :", props.message);
              setOpenModalReply(true);
              setselectedCommentId(commentId);
              setselectedCommentReplyId(props.message._id);
            }}
          >
            <DeleteIcon
              sx={{ fontSize: 16, color: "gray", cursor: "pointer" }}
            />
            <span
              style={{
                fontSize: 12,
                color: "#555555",
                cursor: "pointer",
              }}
            >
              Διαγραφή
            </span>
          </Grid>
        </div>

        {/* Border Divider */}
        <div
          style={{
            borderTop: "1px solid #efefef",
            width: "100%",
            marginTop: 10,
            paddintTop: 10,
          }}
        ></div>
      </Grid>
    );
  }

  const deleteCommentFunction = async () => {
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await deleteSpecificCommentApi(
        url,
        selectedCommentId,
        token
      );
      const data = await response.json();

      // console.log("DATA :", data.data);

      if (data?.resultCode === 0) {
        update();
        updateLeft_Posts_CommentNumber("delete_comment");
      }

      setOpenModal(false);
    } catch (error) {
      console.log("ERROR :", error);
    }
  };

  const deleteReplyFunction = async () => {
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await deleteSpecificReplyCommentApi(
        url,
        selectedCommentId,
        selectedCommentReplyId,
        token
      );
      const data = await response.json();

      //console.log("deleteReply:", data);

      if (data?.resultCode === 0) {
        update();
        updateLeft_Posts_CommentNumber("delete_reply");
      }

      setOpenModal(false);
    } catch (error) {
      console.log("ERROR :", error);
    }
  };

  const calculateTotalComments = () => {
    let top_level = comments?.length;

    let second_level = 0;
    comments.forEach((e) => {
      second_level = second_level + e.replies?.length;
    });

    let sum = top_level + second_level;

    settotalComments(sum);
  };

  // 4) Components
  function CommentsComponent(props) {
    // 1) Data
    const [newComment, setnewComment] = useState("");
    const {
      content,
      author,
      publishedAt,
      isMine,
      _id,
      replies,
      authorAvatar,
      authorProfilePicture,
      reported,
    } = props.message;
    const index = props.index;

    // 3) Function
    const replyToCommentFunction = async () => {
      if (newComment == null || newComment == "") {
        setcommentError(true);
        return;
      }
      setcommentError(false);
      //await setloading(true);
      setdisableButton(true);

      try {
        let url = settings["appSettings :"].baseUrl;
        let token = User.Token;
        let name = User.User.firstName + " " + User.User.lastName;

        let bodyObject = {
          commentId: _id,
          authorId: User.User.userId,
          author: name + " - (Διαχειριστής)",
          authorAvatar: User.User.avatar,
          content: newComment,
          isMine: true,
        };

        const response = await replyCommentApi(url, bodyObject, token);
        const data = await response.json();

        console.log("Reply to comment (response) :", data.response._id);

        if (data?.resultCode == 0) {
          let returned_id = data?.response._id;
          bodyObject._id = returned_id;

          await setnewComment("");
          await update();
          await updateLeft_Posts_CommentNumber("add_reply");
          await setTopcommentError(false);
        }

        await setdisableButton(false);
      } catch (error) {
        console.log("Error posting comment :", error);
        //await setloading(false);
        setdisableButton(false);
      }
    };

    return (
      <Grid
        container
        style={{
          borderLeft: isMine ? "4px solid #0079D3" : "4px solid #ccc",
          paddingLeft: 10,
          paddingTop: 5,
          paddingBottom: 5,
          backgroundColor: isMine ? "#F6F7F8" : "#FFFFFF",
        }}
      >
        {/* Header */}
        <Grid item xs={12} style={{ display: "flex", alignItems: "center" }}>
          <UserAvatar num={authorAvatar} w={28} h={28} profilePicture={authorProfilePicture} />
          <div
            style={{
              marginRight: 5,
              fontSize: 12,
              color: "#555555",
              fontWeight: "bold",
            }}
          >
            {author + " • "}

            <span style={{ fontSize: 12, color: "gray", fontWeight: 500 }}>
              {" "}
              <DateSinceNow date={publishedAt} />
            </span>
          </div>
        </Grid>
        {/* Content */}
        <Grid item xs={12} style={{ fontSize: 14, paddingLeft: 28 }}>
          {content}
        </Grid>
        {/* REported */}{" "}
        {reported && (
          <Grid
            item
            xs={12}
            style={{
              textAlign: "center",
              fontSize: 14,
              color: "red",
              border: "1px solid red",
              padding: 5,
              paddingLeft: 10,
              borderRadius: 3,
              marginTop: 5,
            }}
          >
            <Typography>
              *Αυτό το σχόλιο έχει αναφερθεί από κάποιον χρήστη
            </Typography>
          </Grid>
        )}
        {/* Reply - Delete */}
        <div style={{ display: "flex", marginTop: 5, alignItems: "center" }}>
          {/* Reply */}
          <Grid
            item
            xs={6}
            mr={1}
            style={{ display: "flex", alignItems: "center" }}
            onClick={() => {
              let value = showReply[index];
              replaceElement(index, !value);
            }}
          >
            {showReply[index] ? (
              <CloseIcon sx={{ fontSize: 16, color: "gray" }} />
            ) : (
              <ReplyIcon sx={{ fontSize: 16, color: "gray" }} />
            )}

            <span
              style={{
                fontSize: 12,
                color: "#555555",
                cursor: "pointer",
              }}
            >
              Απάντηση
            </span>
          </Grid>

          {/* Delete */}
          {/* DELETE COMMENT ALLOW ALL */}

          <Grid
            item
            xs={6}
            style={{ display: "flex", alignItems: "center" }}
            onClick={() => {
              //console.log("Comment ID :", props);
              setOpenModal(true);
              setselectedCommentId(_id);
            }}
          >
            <DeleteIcon
              sx={{ fontSize: 16, color: "gray", cursor: "pointer" }}
            />
            <span
              style={{
                fontSize: 12,
                color: "#555555",
                cursor: "pointer",
              }}
            >
              Διαγραφή
            </span>
          </Grid>
        </div>
        {/* Replies */}
        {replies?.length > 0 && (
          <Grid container paddingLeft={3} py={1} style={{ width: "100%" }}>
            {replies.map((item, index) => {
              return (
                <div
                  className={`message-container ${
                    item.isMine ? "mine" : "yours"
                  }`}
                  style={{ width: "100%" }}
                >
                  <ReplyCommentsComponent
                    message={item}
                    index={index}
                    commentId={_id}
                  />
                </div>
              );
            })}
          </Grid>
        )}
        {/* Reply TextField */}
        {showReply[index] && (
          <Grid container mt={1} style={{ paddingRight: 20 }}>
            <Paper
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Απάντηση.."
                inputProps={{ "aria-label": "Απάντηση.." }}
                fullWidth
                size="small"
                value={newComment}
                onChange={(event) => setnewComment(event.target.value)}
              />

              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              {disableButton ? (
                <IconButton
                  color="primary"
                  sx={{ p: "10px" }}
                  aria-label="directions"
                >
                  <CircularProgress size={20} />
                </IconButton>
              ) : (
                <IconButton
                  color="primary"
                  sx={{ p: "10px" }}
                  aria-label="directions"
                  onClick={replyToCommentFunction}
                >
                  <ReplyIcon />
                </IconButton>
              )}
            </Paper>
            {commentError && (
              <Grid item xs={12} mt={1}>
                <Typography color={"red"}>
                  *Πρέπει να γράψεις κάτι για να απαντήσεις.
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
        {/* Border Divider */}
        <div
          style={{
            borderTop: "1px solid #efefef",
            width: "100%",
            marginTop: 10,
            paddintTop: 10,
          }}
        ></div>
      </Grid>
    );
  }

  return (
    <React.Fragment>
      {comments.map((item, index) => {
        return (
          <div
            className={`message-container ${item.isMine ? "mine" : "yours"}`}
          >
            <CommentsComponent message={item} index={index} />
          </div>
        );
      })}

      {/* Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* Title */}
          <Typography id="modal-modal-title" variant="h2" component="h2">
            Διαγραφή σχολίου
          </Typography>
          {/* Content */}
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Είστε σίγουρος/η ότι θέλετε να διαγράψετε το επιλεγμένο σχόλιο ;
          </Typography>
          {/* Buttons */}
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <Button fullWidth onClick={() => setOpenModal(false)}>
                Πίσω
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                style={{ background: "red", color: "white" }}
                onClick={deleteCommentFunction}
              >
                Διαγραφή
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Modal For Reply */}
      <Modal
        open={openModalReply}
        onClose={() => setOpenModalReply(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* Title */}
          <Typography id="modal-modal-title" variant="h2" component="h2">
            Διαγραφή σχολίου
          </Typography>
          {/* Content */}
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Είστε σίγουρος/η ότι θέλετε να διαγράψετε το επιλεγμένο σχόλιο
            (REPLY);
          </Typography>
          {/* Buttons */}
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <Button fullWidth onClick={() => setOpenModalReply(false)}>
                Πίσω
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                style={{ background: "red", color: "white" }}
                onClick={deleteReplyFunction}
              >
                Διαγραφή
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default Comments;
