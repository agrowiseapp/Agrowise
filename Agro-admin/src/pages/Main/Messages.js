import React, { useEffect, useState } from "react";
import NewsCard from "../../components/ui/cards/NewsCard";
import withDrawer from "../../layout/withDrawer";
import { Box, Grid, Modal, Pagination, useMediaQuery } from "@mui/material";
import UsersMessageCard from "../../components/ui/cards/Messages/UsersMessageCard";
import ChatCard from "../../components/ui/cards/Messages/ChatCard";
import data from "../../assets/constants/messages.json";
import HeaderCard from "../../components/ui/cards/Messages/HeaderCard";
import settings from "../../../package.json";
import { useSelector, useDispatch } from "react-redux";
import { getChatsApi } from "../../api/ChatApi";
import { useNavigate } from "react-router-dom";
import { redux_Navigation } from "../../redux/Navigation";
import ModalHeader from "../../components/ui/extra/ModalHeader";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  height: "85vh",
  overflowY: "scroll",
  bgcolor: "background.paper",
  border: "1px solid gray",
  boxShadow: 24,
  p: 0,
  borderRadius: 2,
};

function Messages() {
  // 1) Data
  const User = useSelector((state) => state.User.value);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const Nav = useSelector((state) => state.Navigation.value);
  const [selectedChat, setselectedChat] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [chats, setchats] = useState([]);
  const [filteredData, setfilteredData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const isLargeScreen = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const [openModal, setOpenModal] = useState(false);

  // 2) useEffect
  useEffect(() => {
    getChatsFunction();
  }, []);

  useEffect(() => {
    setOpenModal(true);
    console.log("Chat is selected : ", selectedChat);

    return;
  }, [selectedChat]);

  // Functions
  const getChatsFunction = async () => {
    setLoading(true);
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await getChatsApi(url, token);
      const data = await response.json();

      console.log("Chats :", data);

      //Sorting
      // data.response.forEach((element) => {
      //   console.log("Message Date :", element.lastMessageDate);
      // });

      if (data?.resultCode === 0) {
        setfilteredData(data.response);
        setchats(data.response);
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

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleFilter = (filteredMsgs) => {
    console.log("FILTER :", filteredData);
    setfilteredData(filteredMsgs);
    setCurrentPage(1); // Reset to the first page when applying a filter
  };

  const getDisplayedMessagesCount = () => {
    if (filteredData == null) return;
    const totalMsgs = filteredData.length;
    const firstMsgIndex = (currentPage - 1) * 5 + 1;
    const lastMsgIndex = Math.min(currentPage * 5, totalMsgs);

    if (totalMsgs === 0) {
      return `0 από τα  0`;
    }

    if (totalMsgs === 1) {
      return `1 από τα  1`;
    }

    return `${lastMsgIndex} από τα  ${totalMsgs}`;

    // return `${firstPostIndex} - ${lastPostIndex} από τα  ${totalPosts}`;
  };

  const updateLeftSelectedChat = (obj) => {
    //console.log("Update Called with : ", obj);
    try {
      const id = obj.id;

      // Update the chats state by mapping over the existing chats array
      const updatedChats = chats.map((chat) => {
        if (chat._id === id) {
          // Update the adminRead and userRead fields of the matching chat object
          return {
            ...chat,
            adminRead: true,
            lastMessageText: obj.text,
            lastMessageDate: obj.time,
          };
        }
        return chat;
      });

      console.log("Update ....... : ", updatedChats);

      // Set the updated chats state
      setchats(updatedChats);
      setfilteredData(updatedChats);

      callUpdateonOnNotifications();

      console.log("Chat object updated successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const updateLeftSelectedChatStatus = (_id) => {
    //console.log("Update Called with : ", obj);
    try {
      const id = _id;

      // Update the chats state by mapping over the existing chats array
      const updatedChats = chats.map((chat) => {
        if (chat._id === id) {
          // Update the adminRead and userRead fields of the matching chat object
          return {
            ...chat,
            adminRead: true,
          };
        }
        return chat;
      });

      console.log("Update ....... : ", updatedChats);
      callUpdateonOnNotifications();

      // Set the updated chats state
      setchats(updatedChats);
      setfilteredData(updatedChats);

      console.log("Chat object updated successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const callUpdateonOnNotifications = async () => {
    dispatch(
      redux_Navigation({
        Page: "Επικοινωνία",
        Update: Nav.Update + "_",
      })
    );
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setselectedChat(null);
  };

  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Grid container spacing={4}>
            <Grid item lg={4} md={4} sm={12} xs={12}>
              <HeaderCard
                secondary={getDisplayedMessagesCount()}
                messages={chats}
                setFilteredMessages={handleFilter}
              />

              {isLoading ? (
                <> Loading ...</>
              ) : (
                <>
                  {filteredData !== null &&
                    filteredData !== undefined &&
                    filteredData
                      .slice((currentPage - 1) * 5, currentPage * 5)
                      .map((e) => (
                        <UsersMessageCard
                          isLoading={false}
                          data={e}
                          setselectedChat={setselectedChat}
                        />
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
                      count={Math.ceil(filteredData?.length / 5)}
                      onChange={handlePageChange}
                    />
                  </div>
                </>
              )}
            </Grid>

            <Grid item lg={8} md={8} sm={0} xs={0}>
              {isLargeScreen && (
                <ChatCard
                  // isLoading={selectedPostApiLoading}
                  updateLeftSelectedChat={updateLeftSelectedChat}
                  updateLeftSelectedChatStatus={updateLeftSelectedChatStatus}
                  chat={selectedChat}
                />
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* Modal */}

        {!isLargeScreen && selectedChat !== null && (
          <Modal open={openModal} onClose={handleCloseModal}>
            <Box sx={style}>
              <ModalHeader action={handleCloseModal} />
              <ChatCard
                // isLoading={selectedPostApiLoading}
                updateLeftSelectedChat={updateLeftSelectedChat}
                updateLeftSelectedChatStatus={updateLeftSelectedChatStatus}
                chat={selectedChat}
              />
            </Box>
          </Modal>
        )}
      </Grid>
    </>
  );
}

export default withDrawer(Messages);
