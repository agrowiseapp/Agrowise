import PropTypes from "prop-types";
import { useEffect, useState } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Avatar,
  Button,
  CardActions,
  CardContent,
  Divider,
  Grid,
  Menu,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  IconButton,
  Chip,
} from "@mui/material";

// project imports
import MainCard from "./MainCard";
import SkeletonPopularCard from "../skeletons/LinksCard";
import settings from "../../../../package.json";

// assets
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

import { BsGlobeAmericas, BsFillBookmarkCheckFill } from "react-icons/bs";
import {
  getSettingsApi,
  getSpecificSettingsApi,
  postSettingsApi,
} from "../../../api/SettingsApi";
import { useSelector } from "react-redux";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

// ==============================|| DASHBOARD DEFAULT - POPULAR CARD ||============================== //

const LinksCard = ({ isLoading }) => {
  // 1) Data
  const [showEdit, setShowEdit] = useState(false);
  const User = useSelector((state) => state.User.value);
  const [data, setData] = useState([]);
  const [newLink, setNewLink] = useState({ name: "", url: "" });
  const theme = useTheme();
  const [Loading, setLoading] = useState(false);

  // 2) UseEffects

  useEffect(() => {
    getSettingsFunction();
  }, []);

  // 3) Functions
  const getSettingsFunction = async () => {
    setLoading(true);
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;
      let settingId = 0;

      const response = await getSpecificSettingsApi(url, settingId, token);
      const dataResponse = await response.json();

      //console.log("DATA array RESPONSE:", dataResponse);

      if (dataResponse?.resultCode === 0) {
        let links = dataResponse?.response?.data;
        //console.log("Links:", links);

        setData(dataResponse?.response?.data);
      } else {
      }
      setLoading(false);
    } catch (error) {
      console.log("ERROR :", error);

      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setShowEdit(!showEdit);
    setNewLink({ name: "", url: "" });
  };

  const handleLinkChange = (index, field, value) => {
    const updatedData = [...data];
    updatedData[index][field] = value;
    setData(updatedData);
  };

  const handleAddLink = () => {
    if (newLink.name == "" || newLink.url == "") return;
    const updatedData = [...data, newLink];
    setData(updatedData);
    setNewLink({ name: "", url: "" });
  };

  const handleDeleteLink = (index) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
  };

  const handleSaveLinks = async () => {
    try {
      console.log("Data ready for submit :", data);
      setShowEdit(false);
      postSettingsFunction();
    } catch (error) {
      console.log("Error saving links:", error);
    }
  };

  const postSettingsFunction = async () => {
    setLoading(true);
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      let bodyObject = { setting_id: 0, data };

      //console.log("bodyObject :", bodyObject);

      const response = await postSettingsApi(url, bodyObject, token);
      const dataResponse = await response.json();

      //console.log("DATA :", dataResponse.data);

      if (dataResponse?.resultCode === 0) {
        setLoading(false);
      } else {
      }
    } catch (error) {
      console.log("ERROR :", error);

      setLoading(false);
    }
  };

  return (
    <>
      {Loading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <List sx={{ py: 0, mx: -1 }}>
                  <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
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
                        <BsGlobeAmericas />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      sx={{
                        py: 0,
                      }}
                      primary={
                        <Typography
                          color={theme.palette.primary.light}
                          variant="h4"
                        >
                          Ενημέρωση
                        </Typography>
                      }
                      secondary={
                        <Typography
                          color="gray"
                          variant="p"
                          fontWeight={500}
                          fontSize={12}
                          style={{ cursor: "pointer" }}
                        >
                          Πάτησε στα δεξιά για Επεξεργασία
                        </Typography>
                      }
                    />
                    <ListItemAvatar onClick={handleEditClick}>
                      <Avatar
                        variant="rounded"
                        sx={{
                          ...theme.typography.commonAvatar,
                          ...theme.typography.largeAvatar,
                          backgroundColor: "lightgray",
                          color: "gray",
                        }}
                      >
                        {" "}
                        {showEdit ? <CloseIcon /> : <EditIcon />}
                      </Avatar>
                    </ListItemAvatar>
                  </ListItem>
                </List>
              </Grid>

              {!showEdit ? (
                <Grid item xs={12} mt={2}>
                  <Grid container direction="column">
                    {data?.map((item, index) => (
                      <div key={index}>
                        <Grid item>
                          <Divider />
                        </Grid>

                        <Grid
                          container
                          mb={2}
                          mt={2}
                          alignItems="center"
                          justifyContent="space-between"
                          style={{ cursor: "pointer", overflowX: "hidden" }}
                        >
                          <Grid
                            item
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <BsFillBookmarkCheckFill
                              size={18}
                              color={theme.palette.primary.main}
                            />
                            <Typography
                              variant="subtitle1"
                              color="inherit"
                              style={{ marginLeft: 10 }}
                            >
                              <a
                                href={item.url}
                                target="_blank"
                                style={{
                                  textDecoration: "none",
                                  color: "#333",
                                }}
                              >
                                {item.name}
                              </a>
                            </Typography>
                          </Grid>
                        </Grid>
                      </div>
                    ))}
                    <Divider />
                  </Grid>
                </Grid>
              ) : (
                <Grid item xs={12} mt={2}>
                  <Grid container direction="column">
                    {data?.map((item, index) => (
                      <div key={index}>
                        <Grid item>
                          <Divider />
                        </Grid>

                        <Grid
                          container
                          mb={2}
                          mt={2}
                          alignItems="center"
                          justifyContent="space-between"
                          style={{ cursor: "pointer", overflowX: "hidden" }}
                        >
                          <Grid
                            item
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <BsFillBookmarkCheckFill
                              size={18}
                              color={theme.palette.primary.main}
                            />
                            <Typography
                              variant="subtitle1"
                              color="inherit"
                              style={{ marginLeft: 10 }}
                            >
                              <a
                                href={item.url}
                                target="_blank"
                                style={{
                                  textDecoration: "none",
                                  color: "#333",
                                }}
                              >
                                {item.name}
                              </a>
                            </Typography>
                          </Grid>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteLink(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </div>
                    ))}

                    <div>
                      <Divider />
                    </div>

                    {/* // EDIT */}
                    {showEdit && (
                      <Grid item xs={12} mt={2}>
                        <Grid container direction="column">
                          <Grid item>
                            <Grid item xs={12} mt={1} mb={2}>
                              <TextField
                                label="Τίτλος"
                                fullWidth
                                size="small"
                                value={newLink.name}
                                onChange={(event) =>
                                  setNewLink({
                                    ...newLink,
                                    name: event.target.value,
                                  })
                                }
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                label="Σύνδεσμος"
                                fullWidth
                                size="small"
                                value={newLink.url}
                                onChange={(event) =>
                                  setNewLink({
                                    ...newLink,
                                    url: event.target.value,
                                  })
                                }
                              />
                            </Grid>
                          </Grid>
                          <Grid container spacing={2} mt={2} mb={2}>
                            <Grid item xs={12} style={{ textAlign: "center" }}>
                              <Chip
                                icon={<AddIcon color="gray" />}
                                label="Προσθήκη"
                                onClick={handleAddLink}
                              />
                            </Grid>
                          </Grid>

                          <Divider />
                        </Grid>
                      </Grid>
                    )}

                    {/* SAVE  */}
                    <Grid container spacing={2} mt={2} mb={2}>
                      <Grid item xs={6}>
                        <Button fullWidth onClick={() => setShowEdit(false)}>
                          Άκυρο
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleSaveLinks}
                        >
                          Αποθήκευση
                        </Button>
                      </Grid>
                    </Grid>

                    <Divider />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </MainCard>
      )}
    </>
  );
};

LinksCard.propTypes = {
  isLoading: PropTypes.bool,
};

export default LinksCard;
