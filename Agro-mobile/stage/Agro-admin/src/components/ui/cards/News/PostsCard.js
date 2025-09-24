import PropTypes from "prop-types";
import { useState, useEffect } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import { Grid, Checkbox, TextField, Typography, Avatar } from "@mui/material";
import { AiFillEdit } from "react-icons/ai";
import data from "../../../../assets/constants/posts.json";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DateSinceNow from "../../../../utils/DateSinceNow";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

// project imports
import SkeletonTotalGrowthBarChart from "../../skeletons/QuickPost";
import MainCard from "../MainCard";
import { useDispatch, useSelector } from "react-redux";
import { redux_Navigation } from "../../../../redux/Navigation";

// ==============================|| DASHBOARD DEFAULT - TOTAL GROWTH BAR CHART ||============================== //

const useStyles = makeStyles({
  text: {
    display: "-webkit-box",
    "-webkit-box-orient": "vertical",
    "-webkit-line-clamp": 2,
    overflow: "hidden",
  },
});

const PostsCard = ({ isLoading, data, setselectedPost }) => {
  //1) Data
  const theme = useTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const Nav = useSelector((state) => state.Navigation.value);
  const [firstLoad, setfirstLoad] = useState(true);
  const [showUnreadTemporary, setshowUnreadTemporary] = useState(true);

  // 2) useEffect
  useEffect(() => {
    if (firstLoad) {
      console.log("POST - data :", data);
      setfirstLoad(false);
    }

    return;
  }, []);

  // 3) Fucntions
  const postClicked = () => {
    setselectedPost(data);
    setshowUnreadTemporary(false);

    if (data.unreadComments > 0 && showUnreadTemporary) {
      console.log("");
      dispatch(
        redux_Navigation({
          Page: "Ενημέρωση",
          Update: Nav.Update + "_",
        })
      );
    }
  };

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard
          style={{ marginTop: 10, cursor: "pointer" }}
          onClick={postClicked}
        >
          <Grid container spacing={1}>
            {/* Header + Title + ICon */}
            <Grid
              item
              xs={12}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  marginRight: 1,
                  width: 25,
                  height: 25,
                }}
              >
                <AssignmentIcon fontSize="10" />
              </Avatar>
              <Typography variant="h6">
                {data.author + " • "}
                <span style={{ color: "gray", fontSize: 13, fontWeight: 400 }}>
                  <DateSinceNow date={data.publishedAt} />
                </span>
              </Typography>
            </Grid>

            {/* Text */}
            <Grid item xs={12}>
              <Typography
                variant="body1"
                className={classes.text}
                style={{ fontSize: 16, fontWeight: 500 }}
              >
                {data.title}
              </Typography>
            </Grid>

            {/* Comments */}
            <Grid
              item
              xs={12}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <Typography variant="body1" className={classes.text}>
                {/* Comments */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  {data.unreadComments > 0 && showUnreadTemporary && (
                    <p
                      style={{
                        background: "#006AFF",
                        height: 12,
                        width: 12,
                        display: "flex",
                        justifyContent: "end",
                        borderRadius: 90,
                        marginRight: 10,
                      }}
                    ></p>
                  )}
                  <Typography
                    variant="body1"
                    className={classes.text}
                    style={{
                      color: "gray",
                      alignItems: "center",
                      display: "flex",
                    }}
                  >
                    <ChatBubbleOutlineIcon
                      fontSize="10"
                      style={{ marginRight: 2, marginTop: 0 }}
                    />
                    {data.comments + data.replyComments} Σχόλια{" "}
                    {data.unreadComments > 0 &&
                      showUnreadTemporary &&
                      " - (Δεν διαβάστηκε)"}
                  </Typography>
                </div>
              </Typography>
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

PostsCard.propTypes = {
  isLoading: PropTypes.bool,
};

export default PostsCard;
