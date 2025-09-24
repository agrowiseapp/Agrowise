import PropTypes from "prop-types";
import { useState, useEffect } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Chip,
  Modal,
  Button,
} from "@mui/material";
import moment from "moment";
import Loader from "../../loading/Loader";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import SendIcon from "@mui/icons-material/Send";
import settings from "../../../../../package.json";
import Image from "../../../../assets/images/article.png";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LanguageIcon from "@mui/icons-material/Language";
import DeleteIcon from "@mui/icons-material/Delete";

// project imports
import MainCard from "../MainCard";
import Comments from "./Comments";
import {
  deleteSpecificPostApi,
  getSpecificPostApi,
} from "../../../../api/PostsApi";
import { useSelector } from "react-redux";
import { postNewCommentApi } from "../../../../api/CommentsApi";
import DateSinceNow from "../../../../utils/DateSinceNow";
import { Box } from "@mui/system";

// ==============================|| DASHBOARD DEFAULT - TOTAL GROWTH BAR CHART ||============================== //

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

const SelectedPost = ({
  isLoading,
  setisLoading,
  post,
  getPostsFunction,
  updateTemporaryComments,
}) => {
  //1) Data
  const theme = useTheme();
  const User = useSelector((state) => state.User.value);
  const [newComment, setNewComment] = useState("");
  const [commentsList, setcommentsList] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [selectedPost, setselectedPost] = useState(null);
  const [temporaryComment, settemporaryComment] = useState(
    selectedPost?.comments?.length
  );
  const [openModal, setOpenModal] = useState(false);
  const [commentError, setcommentError] = useState(false);

  // 2) useEffects
  useEffect(() => {
    if (post === null) return;
    setLoading(true);

    window.scroll(0, 0);
    //console.log("Post :", post);
    assignCommentsList();
    getSelectedPostFunction();

    return;
  }, [post]);

  // 3) Function
  const getSelectedPostFunction = async () => {
    setLoading(true);
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await getSpecificPostApi(url, post._id, token);
      const data = await response.json();

      console.log("Selected Post With Comments :", data.response);

      if (data?.resultCode === 0) {
        setselectedPost(data.response.post);
        setcommentsList(data.response.comments);

        calculateTotalComments(
          data?.response?.comments.length,
          data.response.comments
        );

        setLoading(false);
        setisLoading(false);
      } else {
      }
    } catch (error) {
      console.log("ERROR :", error);
      setLoading(false);
      setisLoading(false);
    }
  };

  const assignCommentsList = async () => {
    await setLoading(true);
    //console.log("number_of_comments : ", post.number_of_comments);

    await setcommentsList(post.comments);

    await setLoading(false);
  };

  const postNewComment = async () => {
    if (newComment === "") {
      setcommentError(true);
      return;
    } else {
      setcommentError(false);
      sendCommentToBackend();
    }
  };

  const sendCommentToBackend = async () => {
    if (newComment == null || newComment == "") {
      return;
    }
    setisLoading(true);

    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;
      let name = User.User.firstName + " " + User.User.lastName;

      let bodyObject = {
        postId: post._id,
        authorId: User.User.userId,
        author: name + " - (Διαχειριστής)",
        content: newComment,
        isMine: true,
        authorAvatar: User.User.avatar,
      };

      const response = await postNewCommentApi(url, bodyObject, token);
      const data = await response.json();

      //console.log("Data from publishing comment :", data);

      if (data?.resultCode == 0) {
        let returned_id = data?.response._id;
        bodyObject._id = returned_id;

        await setNewComment("");
        await setisLoading(false);
        await setcommentsList([...commentsList, bodyObject]);
        updateLeft_Posts_CommentNumber("add_comment");
      }
      setisLoading(false);
    } catch (error) {
      console.log("Error posting comment :", error);
      //await setloading(false);
    }
  };

  const deleteSpecificPostFunction = async () => {
    setLoading(true);
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await deleteSpecificPostApi(url, post._id, token);
      const data = await response.json();

      // console.log("DATA :", data.data);

      if (data?.resultCode === 0) {
        console.log("Run the all posts again");
        getPostsFunction();
      }

      setLoading(true);
      setisLoading(false);
      setOpenModal(false);
    } catch (error) {
      console.log("ERROR :", error);
      setLoading(false);
      setisLoading(true);
    }
  };

  const calculateTotalComments = (top, array) => {
    let top_level = top;

    let second_level = 0;
    array.forEach((e) => {
      second_level = second_level + e.replies?.length;
    });

    let sum = top_level + second_level;
    //console.log("Sum :", sum);

    settemporaryComment(sum);
  };

  const updateLeft_Posts_CommentNumber = async (method) => {
    if (method == "add_comment") {
      let temp = temporaryComment + 1;
      settemporaryComment(temp);
      updateTemporaryComments(1, post._id, method);
    } else if (method == "add_reply") {
      let temp = temporaryComment + 1;
      settemporaryComment(temp);
      updateTemporaryComments(1, post._id, method);
    } else if (method == "delete_reply") {
      let temp = temporaryComment - 1;
      settemporaryComment(temp);
      updateTemporaryComments(1, post._id, method);
    } else if (method == "delete_comment") {
      updateTemporaryComments(1, post._id, method);
    }
  };

  return (
    <>
      {Loading ? (
        <Grid
          style={{
            textAlign: "center",
            padding: 100,
            background: "#fff",
            borderRadius: 10,
          }}
        >
          <Typography variant="h3">Δεν έχει επιλεχτεί κάποιο άρθρο</Typography>
          <Typography variant="h5" marginBottom={5}>
            Επιλέξτε κάποιο από τα διαθέσιμα
          </Typography>
          <img src={Image} width="150" />
        </Grid>
      ) : (
        <MainCard>
          {isLoading ? (
            <Loader />
          ) : (
            <Grid container spacing={2}>
              {/* Selected Post */}

              <Grid item xs={12}>
                {selectedPost !== null && (
                  <>
                    {/* Post Section */}
                    <Grid container>
                      <Grid item xs={12} mt={2}>
                        <Typography
                          style={{
                            fontSize: 15,
                            color: "#4b5565",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <EventNoteIcon
                            fontSize="small"
                            style={{ marginRight: 5 }}
                          />
                          <DateSinceNow date={selectedPost.publishedAt} />{" "}
                        </Typography>
                        <Typography variant="h2" style={{ color: "#333" }}>
                          {selectedPost?.title}
                        </Typography>
                        {/* Show post image if exists */}
                        {selectedPost?.imageUrl && (
                          <Box mt={2} mb={2} style={{ textAlign: "center" }}>
                            <img
                              src={selectedPost.imageUrl}
                              alt="Άρθρο"
                              style={{
                                maxWidth: "100%",
                                maxHeight: 400,
                                borderRadius: 8,
                              }}
                            />
                          </Box>
                        )}
                      </Grid>

                      <Grid item xs={12} mt={2}>
                        <Typography>{selectedPost?.text}</Typography>
                      </Grid>
                    </Grid>

                    {/* Chip Section */}
                    <>
                      <div
                        style={{
                          borderTop: "0.5px solid lightgray",
                          marginTop: 15,
                        }}
                      ></div>
                      <Grid container mt={1} style={{ overflow: "auto" }}>
                        <Stack
                          spacing={{ xs: 1, sm: 2 }}
                          direction="row"
                          useFlexGap
                          flexWrap="wrap"
                        >
                          {/* Date */}
                          <Chip
                            label={moment(selectedPost?.publishedAt).format(
                              "DD MMMM YYYY"
                            )}
                            onDelete={() => {}}
                            deleteIcon={<EventNoteIcon />}
                          />

                          {/* Comments */}
                          <Chip
                            label={" " + temporaryComment + " Σχόλια"}
                            onDelete={() => {}}
                            deleteIcon={<ChatBubbleIcon />}
                          />

                          {/* Button To Follow */}
                          {selectedPost?.post_with_url !== null &&
                            selectedPost?.post_with_url !== undefined && (
                              <Chip
                                onClick={() => {
                                  window.open(selectedPost?.post_with_url);
                                }}
                                label={"Δείτε Περισσότερα"}
                                onDelete={() => {
                                  window.open(selectedPost?.post_with_url);
                                }}
                                deleteIcon={<MoreHorizIcon />}
                              />
                            )}

                          {/* Published from */}
                          {selectedPost?.republished !== null &&
                            selectedPost?.republished !== undefined && (
                              <Chip
                                onClick={() => {
                                  window.open(selectedPost?.republished);
                                }}
                                label="Αναδημοσίευση από"
                                onDelete={() => {
                                  window.open(selectedPost?.republished);
                                }}
                                deleteIcon={<LanguageIcon />}
                              />
                            )}

                          {/* Delete */}
                          <Chip
                            label={"Διαγραφή"}
                            onDelete={() => setOpenModal(true)}
                            onClick={() => setOpenModal(true)}
                            deleteIcon={<DeleteIcon />}
                          />
                        </Stack>
                      </Grid>
                      <div
                        style={{
                          borderTop: "0.5px solid lightgray",
                          marginTop: 10,
                        }}
                      ></div>
                    </>

                    {/* Comments Section */}
                    <Grid container mt={1}>
                      {/* comments area */}
                      {!Loading && commentsList?.length > 0 && (
                        <Grid item xs={12}>
                          <Comments
                            comments={commentsList}
                            update={getSelectedPostFunction}
                            updateLeft_Posts_CommentNumber={
                              updateLeft_Posts_CommentNumber
                            }
                            setTopcommentError={setcommentError}
                          />
                        </Grid>
                      )}
                    </Grid>

                    {/* Write Comment */}
                    <Grid container mt={2}>
                      <Grid
                        item
                        xs={12}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Γράψε ένα σχόλιο..."
                          value={newComment}
                          onChange={(event) =>
                            setNewComment(event.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ChatBubbleIcon
                                  style={{
                                    fontSize: 16,
                                    color: "#878A8C",
                                  }}
                                />
                              </InputAdornment>
                            ),
                            sx: {
                              "& .MuiInputBase-root": {
                                borderRadius: 999,
                                backgroundColor: "#F6F7F8",
                                padding: "4px 12px",
                              },
                              "& .MuiInputBase-input": {
                                fontSize: 14,
                                lineHeight: 1.5,
                                color: "#1A1A1B",
                              },
                            },
                          }}
                        />
                        <IconButton
                          onClick={postNewComment}
                          style={{
                            marginLeft: 10,
                            backgroundColor: theme.palette.primary.dark,
                            padding: 8,
                          }}
                        >
                          <SendIcon
                            style={{
                              color: theme.palette.primary.light,
                              fontSize: 16,
                            }}
                          />
                        </IconButton>
                      </Grid>
                      {commentError && (
                        <Grid item xs={12} mt={1}>
                          <Typography color={"red"}>
                            *Πρέπει να γράψεις κάτι για να αφήσεις ένα σχόλιο.
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          )}
        </MainCard>
      )}

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
            Διαγραφή Άρθρου
          </Typography>
          {/* Content */}
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Είστε σίγουρος/η ότι θέλετε να διαγράψετε το επιλεγμένο άρθρο ;
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
                onClick={deleteSpecificPostFunction}
              >
                Διαγραφή
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
};

SelectedPost.propTypes = {
  isLoading: PropTypes.bool,
};

export default SelectedPost;
