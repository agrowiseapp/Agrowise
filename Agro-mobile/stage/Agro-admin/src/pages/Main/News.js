import React, { useEffect, useState } from "react";
import withDrawer from "../../layout/withDrawer";
import {
  Box,
  Grid,
  Modal,
  Pagination,
  Typography,
  useMediaQuery,
} from "@mui/material";
import PostsCard from "../../components/ui/cards/News/PostsCard";
import HeaderCard from "../../components/ui/cards/News/HeaderCard";
import SelectedPost from "../../components/ui/cards/News/SelectedPost";
import settings from "../../../package.json";
import { useSelector } from "react-redux";
import { getPostsApi } from "../../api/PostsApi";
import Loader from "../../components/ui/loading/Loader";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import ModalHeader from "../../components/ui/extra/ModalHeader";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  height: "90%",
  overflowY: "scroll",
  bgcolor: "background.paper",
  border: "1px solid gray",
  boxShadow: 24,
  p: 0,
  borderRadius: 2,
};

function News() {
  // 1) Data
  const User = useSelector((state) => state.User.value);
  const theme = useTheme();
  const navigate = useNavigate();
  const isLargeScreen = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const [selectedPost, setselectedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setfilteredData] = useState(null);
  const [posts, setposts] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [selectedPostApiLoading, setselectedPostApiLoading] = useState(true);
  const [UpdatedComment, setUpdatedComment] = useState(false);
  const [UpdatedCommentNewCount, setUpdatedCommentNewCount] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  // 2) useEffect
  useEffect(() => {
    getPostsFunction();
  }, []);

  useEffect(() => {
    setselectedPostApiLoading(true);

    setOpenModal(true);

    return;
  }, [selectedPost]);

  // 3) Functions

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleFilter = (filteredPosts) => {
    setfilteredData(filteredPosts);

    setCurrentPage(1); // Reset to the first page when applying a filter
  };

  const getDisplayedPostCount = () => {
    if (filteredData == null) return;
    const totalPosts = filteredData.length;
    const firstPostIndex = (currentPage - 1) * 5 + 1;
    const lastPostIndex = Math.min(currentPage * 5, totalPosts);

    if (totalPosts === 0) {
      return `0 από τα  0`;
    }

    if (totalPosts === 1) {
      return `1 από τα  1`;
    }

    return `${lastPostIndex} από τα  ${totalPosts}`;

    // return `${firstPostIndex} - ${lastPostIndex} από τα  ${totalPosts}`;
  };

  const getPostsFunction = async () => {
    setLoading(true);
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await getPostsApi(url, token);
      const data = await response.json();

      console.log("DATA :", data.data);

      if (data?.resultCode === 0) {
        setfilteredData(data.data);
        setposts(data.data);
        setLoading(false);
      } else {
      }
    } catch (error) {
      console.log("ERROR :", error);
      alert(
        "Ο λογαριασμός σας παρέμεινε αρκετή ώρα ανενεργός. Παρακαλώ συνδεθείτε ξανά!"
      );
      navigate("/");
      setLoading(false);
    }
  };

  const updateTemporaryComments = (val, postId, commentType) => {
    console.log("Updating ------val from update : ", val);
    console.log("Updating ------Type from update : ", commentType);

    setUpdatedComment(true);
    setUpdatedCommentNewCount(val);
    if (commentType == "add_comment") {
      let foundObject = filteredData.find((obj) => obj._id === postId);

      //console.log("Filtered Object Found:", foundObject);
      let prevComments = foundObject.comments;
      let totalValue = prevComments + val;

      setfilteredData((prevData) => {
        const updatedData = prevData.map((post) => {
          if (post._id === postId) {
            return { ...post, comments: totalValue };
          }
          return post;
        });
        return updatedData;
      });

      setposts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => {
          if (post._id === postId) {
            return { ...post, comments: totalValue };
          }
          return post;
        });
        return updatedPosts;
      });
    } else if (commentType == "add_reply") {
      let foundObject = filteredData.find((obj) => obj._id === postId);

      //console.log("Filtered Object Found:", foundObject);
      let prevComments = foundObject.replyComments;
      let totalValue = prevComments + val;

      setfilteredData((prevData) => {
        const updatedData = prevData.map((post) => {
          if (post._id === postId) {
            return { ...post, replyComments: totalValue };
          }
          return post;
        });
        return updatedData;
      });

      setposts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => {
          if (post._id === postId) {
            return { ...post, replyComments: totalValue };
          }
          return post;
        });
        return updatedPosts;
      });
    } else if (commentType == "delete_reply") {
      let foundObject = filteredData.find((obj) => obj._id === postId);

      console.log("Filtered Object Found:", foundObject);
      let prevComments = foundObject.replyComments;
      let totalValue = prevComments - val;

      console.log("Replies comments must be now : ", totalValue);

      setfilteredData((prevData) => {
        const updatedData = prevData.map((post) => {
          if (post._id === postId) {
            return { ...post, replyComments: totalValue };
          }
          return post;
        });
        return updatedData;
      });

      setposts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => {
          if (post._id === postId) {
            return { ...post, replyComments: totalValue };
          }
          return post;
        });
        return updatedPosts;
      });
    } else {
      let foundObject = filteredData.find((obj) => obj._id === postId);

      console.log("Filtered Object Found:", foundObject);
      let prevComments = foundObject.comments;

      let totalValue = prevComments - val;

      setfilteredData((prevData) => {
        const updatedData = prevData.map((post) => {
          if (post._id === postId) {
            return { ...post, comments: totalValue, replyComments: 0 };
          }
          return post;
        });
        return updatedData;
      });

      setposts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => {
          if (post._id === postId) {
            return { ...post, comments: totalValue };
          }
          return post;
        });
        return updatedPosts;
      });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setselectedPost(null);
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item lg={4} md={4} sm={12} xs={12}>
            <HeaderCard
              secondary={getDisplayedPostCount()}
              posts={posts}
              setFilteredPosts={handleFilter}
            />
            {isLoading ? (
              <Loader />
            ) : (
              <>
                {filteredData !== null &&
                  filteredData
                    .slice((currentPage - 1) * 5, currentPage * 5)
                    .map((e) => (
                      <PostsCard data={e} setselectedPost={setselectedPost} />
                    ))}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 25,
                    marginBottom: 15,
                  }}
                >
                  <Pagination
                    count={Math.ceil(filteredData.length / 5)}
                    onChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </Grid>
          <Grid item lg={8} md={8} sm={0} xs={0}>
            {isLargeScreen && (
              <SelectedPost
                isLoading={selectedPostApiLoading}
                setisLoading={setselectedPostApiLoading}
                post={selectedPost}
                updateTemporaryComments={updateTemporaryComments}
                getPostsFunction={getPostsFunction}
              />
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Modal */}

      {!isLargeScreen && selectedPost !== null && (
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={style}>
            <ModalHeader action={handleCloseModal} />
            <SelectedPost
              isLoading={selectedPostApiLoading}
              setisLoading={setselectedPostApiLoading}
              post={selectedPost}
              updateTemporaryComments={updateTemporaryComments}
              getPostsFunction={getPostsFunction}
            />
          </Box>
        </Modal>
      )}
    </Grid>
  );
}

export default withDrawer(News);
