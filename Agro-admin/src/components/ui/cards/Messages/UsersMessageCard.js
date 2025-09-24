import PropTypes from "prop-types";
import { useState, useEffect } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import { Grid, Typography, Avatar, Badge } from "@mui/material";

// project imports
import SkeletonTotalGrowthBarChart from "../../skeletons/QuickPost";
import MainCard from "../MainCard";
import moment from "moment";
import UserAvatar from "../../../../utils/UserAvatar";
import { makeStyles } from "@material-ui/core/styles";
import DateSinceNow from "../../../../utils/DateSinceNow";

const useStyles = makeStyles((theme) => ({
  chatItem: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f1f1f1",
    },
  },
  avatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    marginRight: theme.spacing(2),
  },
  unreadBadge: {
    background: "#006AFF",
    borderRadius: "50%",
    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
  },
}));

// ==============================|| DASHBOARD DEFAULT - TOTAL GROWTH BAR CHART ||============================== //

const UsersMessageCard = ({ isLoading, data, setselectedChat }) => {
  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard
          style={{ cursor: "pointer", marginTop: 10 }}
          onClick={() => {
            setselectedChat(data);
          }}
        >
          <Grid container spacing={1}>
            {/* Message */}
            <Grid item xs={10} style={{ display: "flex", alignItems: "start" }}>
              {/* Icon */}
              <UserAvatar num={data.avatar} w={38} h={38} />

              {/* Name + Last Message */}
              <div style={{ marginLeft: 4 }}>
                <Typography
                  variant="h4"
                  style={{ marginRight: 5, color: "#333" }}
                >
                  {data?.user}
                </Typography>
                <Typography
                  variant="body2"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontWeight: data?.adminRead === false ? 600 : 400,
                    color: data?.adminRead === false ? "#006AFF" : "#495057",
                  }}
                >
                  {data?.lastMessageText == ""
                    ? "Νέα συνομιλία"
                    : data?.lastMessageText}
                </Typography>
              </div>
            </Grid>

            {/* Unread */}
            {data?.adminRead == false && (
              <Grid item xs={2}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <p
                    style={{
                      background: "#006AFF",
                      height: 12,
                      width: 12,
                      display: "flex",
                      justifyContent: "end",
                      borderRadius: 90,
                      boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                    }}
                  ></p>
                </div>
              </Grid>
            )}

            {/* Date + Notification */}
            <Grid item xs={12} style={{ textAlign: "end", marginBottom: -10 }}>
              <Typography variant="body2" style={{ color: "gray" }}>
                <DateSinceNow date={data?.lastMessageDate} />
              </Typography>
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

UsersMessageCard.propTypes = {
  isLoading: PropTypes.bool,
};

export default UsersMessageCard;
