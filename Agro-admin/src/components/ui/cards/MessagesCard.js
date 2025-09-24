import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { redux_Navigation } from "../../../redux/Navigation";

// material-ui
import { useTheme, styled } from "@mui/material/styles";
import { Avatar, Box, Button, Grid, Typography } from "@mui/material";

// project imports
import MainCard from "./MainCard";
import SkeletonTotalOrderCard from "../skeletons/NewsCard";
import { getChatNotificationApi } from "../../../api/NotificationsApi";
import settings from "../../../../package.json";
import { getChatsNumber } from "../../../api/ChatApi";

// assets

const CardWrapper = styled(MainCard)(({ theme }) => ({
  color: theme.palette.primary.main,
  overflow: "hidden",
  position: "relative",
  "&>div": {
    position: "relative",
    zIndex: 5,
  },
  "&:after": {
    content: '""',
    position: "absolute",
    width: 210,
    height: 210,
    background: `linear-gradient(210.04deg, ${theme.palette.primary.dark} -0.94%, rgba(144, 202, 249, 0) 95.49%)`,
    borderRadius: "50%",
    zIndex: 1,
    top: -85,
    right: -95,
    [theme.breakpoints.down("sm")]: {
      top: -105,
      right: -140,
    },
  },
  "&:before": {
    content: '""',
    position: "absolute",
    zIndex: 1,
    width: 210,
    height: 210,
    background: `linear-gradient(140.9deg, ${theme.palette.primary.dark} -4.02%, rgba(144, 202, 249, 0) 96.50%)`,
    borderRadius: "50%",
    top: -125,
    right: -15,
    opacity: 0.5,
    [theme.breakpoints.down("sm")]: {
      top: -155,
      right: -70,
    },
  },
}));

const styles = {
  cardExtra: {
    cursor: "pointer",
  },
};

// ==============================|| DASHBOARD - TOTAL ORDER LINE CHART CARD ||============================== //

const MessagesCard = ({ isLoading }) => {
  // 1)Data
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [timeValue, setTimeValue] = useState(false);
  const [newMessages, setnewMessages] = useState(0);
  const User = useSelector((state) => state.User.value);
  const [numberOfChats, setnumberOfChats] = useState(0);

  // 2) UseEffects
  useEffect(() => {
    getChatNotificationsFunction();
    getChatsNumberFunction();

    return;
  }, []);

  // 3) Functions
  const navigateFunction = () => {
    dispatch(
      redux_Navigation({
        Page: "Επικοινωνία",
      })
    );
    navigate("/Messages");
  };

  const getChatNotificationsFunction = async () => {
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await getChatNotificationApi(url, token);
      const data = await response.json();

      //console.log("Notifications :", data.response);

      if (data?.resultCode === 0) {
        let chat_not = data?.response;
        if (chat_not != 0) {
          let int = parseInt(chat_not);
          setnewMessages(int);
        } else {
          setnewMessages(0);
        }
      } else {
      }
    } catch (error) {
      console.log("Error trying to get Comments Notifications :", error);
      alert(
        "Ο λογαριασμός σας παρέμεινε αρκετή ώρα ανενεργός. Παρακαλώ συνδεθείτε ξανά!"
      );
      navigate("/");
    }
  };

  const getChatsNumberFunction = async () => {
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await getChatsNumber(url, token);
      const data = await response.json();

      //console.log("Notifications :", data.response);

      if (data?.resultCode === 0) {
        let num = data?.count;
        setnumberOfChats(num);
      } else {
      }
    } catch (error) {
      console.log("Error trying to get Comments Notifications :", error);
      alert(
        "Ο λογαριασμός σας παρέμεινε αρκετή ώρα ανενεργός. Παρακαλώ συνδεθείτε ξανά!"
      );
      navigate("/");
    }
  };

  return (
    <>
      {isLoading ? (
        <SkeletonTotalOrderCard />
      ) : (
        <CardWrapper
          border={false}
          content={false}
          style={styles.cardExtra}
          onClick={navigateFunction}
        >
          <Box sx={{ p: 2.25 }}>
            <Grid container direction="column">
              <Grid item>
                <Grid container justifyContent="space-between">
                  <Grid item>
                    <Button
                      disableElevation
                      variant={!timeValue ? "contained" : "text"}
                      size="small"
                    >
                      {newMessages + " Νέα Μηνύματα"}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sx={{ mb: 0.75 }}>
                <Grid container alignItems="center">
                  <Grid item xs={12}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Typography
                          sx={{
                            fontSize: "2.125rem",
                            fontWeight: 500,
                            mr: 1,
                            mt: 1.5,
                            mb: 0.5,
                          }}
                        >
                          {numberOfChats + " "}
                          <span
                            style={{ fontSize: "1.125rem", fontWeight: 600 }}
                          >
                            Συνολικά Συνομιλίες
                          </span>
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography
                          sx={{
                            fontSize: "1rem",
                            fontWeight: 500,
                            color: theme.palette.primary.main,
                          }}
                        >
                          Προβολή μηνυμάτων
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

MessagesCard.propTypes = {
  isLoading: PropTypes.bool,
};

export default MessagesCard;
