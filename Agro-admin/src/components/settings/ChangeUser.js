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
  FormGroup,
  FormControl,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

// project imports
import MainCard from "../ui/cards/MainCard";
import SkeletonPopularCard from "../ui/skeletons/LinksCard";
import settings from "../../../package.json";

// assets
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import { BsGlobeAmericas, BsFillBookmarkCheckFill } from "react-icons/bs";
import {
  getSettingsApi,
  getSpecificSettingsApi,
  postSettingsApi,
} from "../../api/SettingsApi";
import { useSelector } from "react-redux";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { editAdminApi, getAllUsersApi } from "../../api/LoginApi";
import { CheckBox } from "@material-ui/icons";

// ==============================|| DASHBOARD DEFAULT - POPULAR CARD ||============================== //

const ChangeUser = ({ isLoading }) => {
  // 1) Data
  const User = useSelector((state) => state.User.value);
  const theme = useTheme();
  const [Loading, setLoading] = useState(false);
  const [userLevel, setuserLevel] = useState(false);
  const [email, setemail] = useState("");

  // 2) UseEffects

  useEffect(() => {}, []);

  // 3) Functions

  const updateUserLevel = async () => {
    console.log("PRESSED :", email);
    if (email == "") return;
    setLoading(true);
    let admin_email = await removeSpace(email);

    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      let bodyObject = { email: admin_email, userLevel: userLevel ? 1 : 2 };

      //console.log("bodyObject :", bodyObject);

      const response = await editAdminApi(url, bodyObject, token);
      const dataResponse = await response.json();

      //console.log("DATA :", dataResponse.data);

      if (dataResponse?.resultCode === 0) {
        window.location.reload(false);
      } else {
      }
      setLoading(false);
    } catch (error) {
      console.log("ERROR :", error);

      setLoading(false);
    }
  };

  const removeSpace = (str) => {
    str = str.replace(/\s/g, "");
    return str;
  };

  return (
    <>
      {Loading ? (
        <SkeletonPopularCard />
      ) : (
        <Grid container spacing={2}>
          {/* Settings */}
          <Grid item xs={12}>
            <MainCard content={false}>
              <CardContent>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <List sx={{ py: 0, mx: -1 }}>
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
                            <AdminPanelSettingsIcon />
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
                              Επεξεργασία Διαχειριστή
                            </Typography>
                          }
                        />
                      </ListItem>
                    </List>
                  </Grid>

                  <Grid item xs={12} mt={2}>
                    <Grid container direction="column">
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            margin="normal"
                            required
                            size="small"
                            fullWidth
                            name="Email"
                            label="Email"
                            value={email}
                            onChange={(type) => setemail(type.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} mb={1}>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={userLevel}
                                  onClick={() => setuserLevel(true)}
                                />
                              }
                              label="Απλός διαχειριστής"
                            />
                            <FormControlLabel
                              required
                              control={
                                <Checkbox
                                  checked={!userLevel}
                                  onClick={() => setuserLevel(false)}
                                />
                              }
                              label="Υπερχρήστης"
                            />
                          </FormGroup>
                        </Grid>
                      </Grid>

                      <Divider />

                      {/* SAVE  */}
                      <Grid container spacing={2} mt={2} mb={2}>
                        <Grid item xs={12} style={{ textAlign: "center" }}>
                          <Button variant="contained" onClick={updateUserLevel}>
                            Αποθήκευση
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </MainCard>
          </Grid>
        </Grid>
      )}
    </>
  );
};

ChangeUser.propTypes = {
  isLoading: PropTypes.bool,
};

export default ChangeUser;
