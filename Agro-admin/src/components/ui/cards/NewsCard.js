import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { redux_Navigation } from "../../../redux/Navigation";
import moment from "moment";
import { DateTime } from "luxon";

// material-ui
import { styled, useTheme } from "@mui/material/styles";
import { Avatar, Box, Grid, Menu, MenuItem, Typography } from "@mui/material";

// project imports
import MainCard from "./MainCard";
import SkeletonEarningCard from "../skeletons/NewsCard";

const CardWrapper = styled(MainCard)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "#fff",
  overflow: "hidden",
  position: "relative",
  "&:after": {
    content: '""',
    position: "absolute",
    width: 210,
    height: 210,
    background: theme.palette.primary.dark,
    borderRadius: "50%",
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
    width: 210,
    height: 210,
    background: theme.palette.primary[200],
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

// ===========================|| DASHBOARD DEFAULT - EARNING CARD ||=========================== //

const NewsCard = ({ isLoading }) => {
  // 1) Data
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [date, setdate] = useState(null);
  const [greeting, setgreeting] = useState(null);

  // 2) useEffects
  useEffect(() => {
    let todays_date = DateTime.local().toLocaleString(DateTime.DATE_HUGE);
    setdate(todays_date);
    return;
  }, []);

  // 3) Functions
  const navigateFunction = () => {
    dispatch(
      redux_Navigation({
        Page: "Ενημέρωση",
      })
    );
    navigate("/News");
  };

  const Greeting = () => {
    const currentTime = moment();
    const currentHour = currentTime.hour();
    let greeting;

    if (currentHour >= 5 && currentHour < 12) {
      greeting = "Καλημέρα";
    } else if (currentHour >= 12 && currentHour < 18) {
      greeting = "Καλησπέρα";
    } else {
      greeting = "Καλό βράδυ";
    }

    return (
      <Typography sx={{ fontSize: "1.2rem", fontWeight: 400, mt: 2 }}>
        {greeting}
      </Typography>
    );
  };

  return (
    <>
      {isLoading ? (
        <SkeletonEarningCard />
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
                <Grid container mt={1} style={{ zIndex: 100 }}>
                  <Typography variant="h4">{date}</Typography>
                </Grid>
                <Grid container mt={1}>
                  <Greeting />
                </Grid>
              </Grid>
              <Grid item>
                <Grid container alignItems="center">
                  <Grid item>
                    <Typography
                      sx={{
                        fontSize: "1.75rem",
                        fontWeight: 500,
                        mr: 1,
                        mt: 1.75,
                        mb: 0.75,
                      }}
                    >
                      Προβολή άρθρων
                    </Typography>
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

NewsCard.propTypes = {
  isLoading: PropTypes.bool,
};

export default NewsCard;
