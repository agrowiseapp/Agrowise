import PropTypes from "prop-types";
import { useState, useEffect, forwardRef } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Grid,
  Checkbox,
  TextField,
  Typography,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Modal,
  Box,
  FormControlLabel,
  IconButton,
  Card,
  CardMedia,
  LinearProgress,
} from "@mui/material";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete, MdAddPhotoAlternate } from "react-icons/md";
import { postCreateNewPostApi, uploadImageApi } from "../../../api/PostsApi";
import settings from "../../../../package.json";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import imageCompression from "browser-image-compression";

// project imports
import SkeletonTotalGrowthBarChart from "../skeletons/QuickPost";
import MainCard from "./MainCard";
import { useSelector } from "react-redux";

// ==============================|| DASHBOARD DEFAULT - TOTAL GROWTH BAR CHART ||============================== //

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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

const QuickPost = ({ isLoading, setrefresh, refresh }) => {
  // 1) Data
  const User = useSelector((state) => state.User.value);
  const theme = useTheme();
  const [title, settitle] = useState("");
  const [text, settext] = useState("");
  const [republished, setrepublished] = useState(false);
  const [republishedText, setrepublishedText] = useState("");
  const [postWithUrl, setpostWithUrl] = useState(false);
  const [postWithUrlText, setpostWithUrlText] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setloading] = useState(false);
  const [imagePreview, setimagePreview] = useState(null);
  const [selectedImage, setselectedImage] = useState(null);
  const [imageUploading, setimageUploading] = useState(false);
  const [imageError, setimageError] = useState("");

  //Errors
  const [titleError, settitleError] = useState(false);
  const [textError, settextError] = useState(false);
  const [republishedTextError, setrepublishedTextError] = useState(false);
  const [postWithUrlTextError, setpostWithUrlTextError] = useState(false);

  //Api Response Alert
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setalertType] = useState("error");
  const [alertMessage, setalertMessage] = useState("");

  // 2) UseEffects

  useEffect(() => {
    //console.log("CHECK BOX : ", postWithUrl);

    return;
  }, [postWithUrl]);

  // 3) Functions

  const handleSubmitArticle = async () => {
    let check = await validateArticle();

    console.log("Check:", check);

    if (check) PostArticle();
  };

  const handleOpenModal = async () => {
    let check = await validateArticle();

    //console.log("Check:", check);

    if (check) setOpenModal(true);
  };

  const validateArticle = async () => {
    let oneError = await validateTitle();
    let twoError = await validateText();
    let threeError = await validateRepublishedText();
    let fourError = await validatePostWithUrl();

    let result = [!oneError, !twoError, !threeError, !fourError].every(Boolean);

    return result;
  };

  const PostArticle = async () => {
    setloading(true);
    let finalImageUrl = null;

    try {
      // 1. Upload image first if selected
      if (selectedImage && imagePreview) {
        setimageUploading(true);
        try {
          // Convert image to base64
          const base64Data = imagePreview; // imagePreview already contains base64 data

          const base64Image = base64Data.replace(
            /^data:image\/[a-zA-Z0-9+]+;base64,/,
            ""
          );

          let url = settings["appSettings :"].baseUrl;
          let token = User.Token;

          // Upload to backend/ImgBB
          const uploadResponse = await uploadImageApi(
            url,
            base64Image,
            selectedImage.name,
            token
          );
          const uploadData = await uploadResponse.json();

          if (uploadData?.resultCode === 0) {
            finalImageUrl = uploadData.response.imageUrl;
            console.log("✅ Image uploaded successfully:", finalImageUrl);
          } else {
            throw new Error(uploadData.error || "Image upload failed");
          }
        } catch (uploadError) {
          console.error("❌ Image upload error:", uploadError);
          setOpenAlert(true);
          setalertType("error");
          setalertMessage(
            "Η ανέβασμα της εικόνας απέτυχε. Παρακαλώ δοκιμάστε ξανά."
          );
          setloading(false);
          setimageUploading(false);
          return;
        } finally {
          setimageUploading(false);
        }
      }

      // 2. Create the post with image URL
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;
      let name = User.User.firstName + " " + User.User.lastName;

      let newObject = {
        author: name + " - (Διαχειριστής)",
        title: title,
        text: text,
        imageUrl: finalImageUrl, // Add the image URL here
      };

      if (postWithUrl) newObject.post_with_url = postWithUrlText;
      if (republished) newObject.republished = republishedText;

      console.log("📤 Sending post with imageUrl:", finalImageUrl);

      const response = await postCreateNewPostApi(url, newObject, token);
      const data = await response.json();

      if (data?.resultCode === 0) {
        setOpenAlert(true);
        setOpenModal(false);
        setalertType("success");
        setalertMessage("Επιτυχής! Το άρθρο έχει δημοσιευτεί.");

        // Reset form
        settitle("");
        settext("");
        setpostWithUrlText("");
        setrepublishedText("");
        setpostWithUrl(false);
        setrepublished(false);
        setimagePreview(null);
        setselectedImage(null);
        setimageUploading(false);
        setimageError("");

        setrefresh(!refresh);
      } else {
        setOpenAlert(true);
        setalertType("error");
        setalertMessage("Κάτι πήγε στραβά. Το άρθρο δεν έχει δημοσιευτεί.");
      }
    } catch (error) {
      console.log("Error :", error);
      setOpenAlert(true);
      setalertType("error");
      setalertMessage("Κάτι πήγε στραβά. Το άρθρο δεν έχει δημοσιευτεί.");
    } finally {
      setloading(false);
    }
  };

  //validations
  const validateTitle = async () => {
    if (title == null || title == "" || title?.length < 3) {
      settitleError(true);
      return true;
    } else {
      settitleError(false);
      return false;
    }
  };

  const validateText = async () => {
    if (text == null || text == "" || text?.length < 3) {
      settextError(true);
      return true;
    } else {
      settextError(false);
      return false;
    }
  };

  const validateRepublishedText = async () => {
    if (republished) {
      if (
        republishedText == null ||
        republishedText == "" ||
        republishedText?.length < 3
      ) {
        setrepublishedTextError(true);
        return true;
      } else {
        const hasHttp = republishedText.startsWith("http://");
        const hasHttps = republishedText.startsWith("https://");

        if (!hasHttp && !hasHttps) {
          // If neither "http://" nor "https://" is present, add "http://" in front
          setrepublishedText("https://" + republishedText);
        } else {
          setrepublishedText(republishedText); // No need to modify the string, retain as it is
        }

        setrepublishedTextError(false);

        return false;
      }
    } else {
      return false;
    }
  };

  const validatePostWithUrl = async () => {
    if (postWithUrl) {
      if (
        postWithUrlText == null ||
        postWithUrlText == "" ||
        postWithUrlText?.length < 3
      ) {
        setpostWithUrlTextError(true);
        return true;
      } else {
        const hasHttp = postWithUrlText.startsWith("http://");
        const hasHttps = postWithUrlText.startsWith("https://");

        if (!hasHttp && !hasHttps) {
          // If neither "http://" nor "https://" is present, add "http://" in front
          setpostWithUrlText("https://" + postWithUrlText);
        } else {
          setpostWithUrlText(postWithUrlText); // No need to modify the string, retain as it is
        }

        setpostWithUrlTextError(false);
        return false;
      }
    } else {
      return false;
    }
  };

  const resetForm = async () => {};

  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setimageError("Παρακαλώ επιλέξτε μόνο αρχεία εικόνας.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setimageError("Η εικόνα πρέπει να είναι μικρότερη από 5MB.");
        return;
      }

      try {
        // Compress the image
        const options = {
          maxSizeMB: 1, // Target max size in MB
          maxWidthOrHeight: 1200, // Max width or height
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);
        setselectedImage(compressedFile);
        setimageError("");

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setimagePreview(e.target.result);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        setimageError("Η συμπίεση της εικόνας απέτυχε.");
        console.error("Image compression error:", error);
      }
    }
  };

  const removeImage = () => {
    setimagePreview(null);
    setselectedImage(null);
    setimageError("");
  };

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          {/* Content */}
          <Grid container spacing={2}>
            {/* Header */}
            <Grid item xs={12}>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
              >
                {/* Header */}
                <Grid item>
                  <Grid container direction="column" spacing={1}>
                    <Grid
                      item
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <List sx={{ py: 0 }}>
                        <ListItem
                          alignItems="center"
                          disableGutters
                          sx={{ py: 0 }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              variant="rounded"
                              sx={{
                                ...theme.typography.commonAvatar,
                                ...theme.typography.largeAvatar,
                                backgroundColor: theme.palette.primary.dark,
                                color: theme.palette.primary.light,
                              }}
                            >
                              <AiFillEdit />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            sx={{
                              py: 0,
                            }}
                            primary={
                              <Typography
                                color={theme.palette.primary.light}
                                variant="h3"
                              >
                                Γράψε ένα νέο Άρθρο
                              </Typography>
                            }
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                id="article-title"
                label="Τίτλος"
                variant="outlined"
                value={title}
                onChange={(type) => settitle(type.target.value)}
              />
            </Grid>

            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Εικόνα άρθρου (προαιρετικό)
              </Typography>

              {!imagePreview ? (
                <Box
                  sx={{
                    border: "2px dashed #ccc",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "action.hover",
                    },
                  }}
                  onClick={() => document.getElementById("image-input").click()}
                >
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageSelect}
                  />
                  <MdAddPhotoAlternate size={48} color="#ccc" />
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Κάντε κλικ για να επιλέξετε εικόνα
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Μέγιστο μέγεθος: 5MB
                  </Typography>
                  {imageError && (
                    <Typography variant="caption" color="error">
                      {imageError}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Card sx={{ maxWidth: 300, width: '100%' }}>
                    <CardMedia
                      component="img"
                      image={imagePreview}
                      alt="Preview"
                      sx={{
                        objectFit: "contain",
                        maxHeight: 200,
                        width: "100%",
                        height: "auto"
                      }}
                    />
                  <Box
                    sx={{
                      p: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      {selectedImage?.name}
                    </Typography>
                    <IconButton
                      onClick={removeImage}
                      color="error"
                      size="small"
                    >
                      <MdDelete />
                    </IconButton>
                  </Box>
                  </Card>
                </Box>
              )}

              {imageUploading && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    backgroundColor: 'primary.light',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body1" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                    📤 Ανέβασμα εικόνας...
                  </Typography>
                  <LinearProgress sx={{ mb: 1 }} />
                  <Typography variant="caption" color="textSecondary">
                    Παρακαλώ περιμένετε μέχρι να ολοκληρωθεί η αποστολή
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Post Content */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="article-content"
                label="Περιεχόμενο άρθρου.."
                variant="outlined"
                multiline
                rows={10}
                value={text}
                onChange={(type) => settext(type.target.value)}
              />
            </Grid>

            {/* Anadimosiefsi arthrou */}
            <Grid item xs={12} lg={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={republished}
                    onChange={() => setrepublished(!republished)}
                  />
                }
                label="Αναδημοσίευση άρθρου;"
              />
              <TextField
                fullWidth
                size="small"
                id="article-republish"
                label="Αναδημοσίευση από σύνδεσμο"
                variant="outlined"
                disabled={!republished}
                value={republishedText}
                onChange={(type) => setrepublishedText(type.target.value)}
              />
            </Grid>

            {/* Read More */}
            <Grid item xs={12} lg={6}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  checked={postWithUrl}
                  onChange={() => setpostWithUrl(!postWithUrl)}
                  inputProps={{ "aria-label": "controlled" }}
                />
                <Typography variant="body1">Διαβάστε περισσότερα;</Typography>
              </div>
              <TextField
                fullWidth
                size="small"
                id="article-mre"
                label="Εξωτερικός σύνδεσμος"
                variant="outlined"
                disabled={!postWithUrl}
                value={postWithUrlText}
                onChange={(type) => setpostWithUrlText(type.target.value)}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleOpenModal}
                disabled={imageUploading}
              >
                Δημοσίευση
              </Button>
            </Grid>
          </Grid>
        </MainCard>
      )}

      {/* Api Response Alert */}
      <Snackbar
        open={openAlert}
        autoHideDuration={6000}
        onClose={() => setOpenAlert(false)}
      >
        <Alert
          onClose={() => setOpenAlert(false)}
          severity={alertType}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

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
            Δημοσίευση άρθρου
          </Typography>
          {/* Content */}
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Είστε σίγουρος/η ότι θέλετε να δημοσιεύσετε αυτό το άρθρο ;
          </Typography>
          {/* Buttons */}
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <Button fullWidth onClick={() => setOpenModal(false)}>
                Πίσω
              </Button>
            </Grid>
            <Grid item xs={6}>
              {loading ? (
                <>
                  <Button
                    disabled
                    style={{
                      background: theme.palette.primary.dark,
                      color: "white",
                    }}
                  >
                    Αποστολή ...
                  </Button>
                </>
              ) : (
                <Button
                  fullWidth
                  style={{
                    background: theme.palette.primary.dark,
                    color: "white",
                  }}
                  onClick={handleSubmitArticle}
                  disabled={imageUploading}
                >
                  Δημοσίευση
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
};

QuickPost.propTypes = {
  isLoading: PropTypes.bool,
};

export default QuickPost;
