import React, { useEffect, useState } from "react";
import NewsCard from "../../components/ui/cards/NewsCard";
import withDrawer from "../../layout/withDrawer";
import { Grid } from "@mui/material";
import MessagesCard from "../../components/ui/cards/MessagesCard";
import SmallSideCard from "../../components/ui/cards/SmallSideCard";
import QuickPost from "../../components/ui/cards/QuickPost";
import LinksCard from "../../components/ui/cards/LinksCard";
import settings from "../../../package.json";
import { getPostsApi, getPostsNumber, getImagesNumber } from "../../api/PostsApi";
import { useSelector } from "react-redux";
import { UserStatsApi } from "../../api/LoginApi";

function Dashboard() {
  // 1) Data
  const [postsNumber, setpostsNumber] = useState(0);
  const [usersNumber, setusersNumber] = useState(0);
  const [imagesNumber, setimagesNumber] = useState(0);
  const [refresh, setrefresh] = useState(false);
  const User = useSelector((state) => state.User.value);

  //Loadings
  const [postNumberLoading, setpostNumberLoading] = useState(true);
  const [userStatsLoading, setuserStatsLoading] = useState(true);
  const [imagesNumberLoading, setimagesNumberLoading] = useState(true);

  // 2) UseEffect
  useEffect(() => {
    getPostsNumberFunction();
    getImagesNumberFunction();

    return;
  }, [refresh]);

  useEffect(() => {
    getUserStatsFunction();

    return;
  }, []);

  // 3) Functions
  const getPostsNumberFunction = async () => {
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await getPostsNumber(url, token);
      const data = await response.json();

      //console.log("DATA :", data.count);

      if (data?.resultCode === 0) {
        setpostsNumber(data.count);
        setpostNumberLoading(false);
      } else {
      }
    } catch (error) {
      console.log("ERROR :", error);
      setpostNumberLoading(false);
    }
  };

  const getUserStatsFunction = async () => {
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await UserStatsApi(url, token);
      const data = await response.json();

      console.log("User :", data.response);

      if (data?.resultCode === 0) {
        setusersNumber(data.response.count);
        setuserStatsLoading(false);
      } else {
      }
    } catch (error) {
      console.log("ERROR :", error);
      setuserStatsLoading(false);
    }
  };

  const getImagesNumberFunction = async () => {
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await getImagesNumber(url, token);
      const data = await response.json();

      if (data?.resultCode === 0) {
        setimagesNumber(data.count);
        setimagesNumberLoading(false);
      } else {
      }
    } catch (error) {
      console.log("ERROR :", error);
      setimagesNumberLoading(false);
    }
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <NewsCard isLoading={false} />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <MessagesCard isLoading={false} />
          </Grid>
          <Grid item lg={4} md={12} sm={12} xs={12}>
            <Grid container spacing={4}>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <SmallSideCard
                  isLoading={userStatsLoading}
                  text={"Αριθμός χρηστών : " + usersNumber}
                  icon="PeopleAltIcon"
                />
              </Grid>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <SmallSideCard
                  isLoading={postNumberLoading}
                  text={"Αριθμός άρθρων : " + postsNumber}
                  ixon="ArticleIcon"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <QuickPost
              isLoading={false}
              setrefresh={setrefresh}
              refresh={refresh}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <SmallSideCard
                  isLoading={imagesNumberLoading}
                  text={"Αριθμός εικόνων : " + imagesNumber}
                  icon="PhotoIcon"
                />
              </Grid>
              <Grid item xs={12}>
                <LinksCard isLoading={false} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default withDrawer(Dashboard);
