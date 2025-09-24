import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import userImage from "../assets/images/admin.png";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { IoIosNotifications } from "react-icons/io";
import { Alert, Badge, Divider } from "@mui/material";
import { BiLogOut } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { redux_resetNavigation } from "../redux/Navigation";
import { redux_resetUser } from "../redux/User";
import { useEffect, useState } from "react";
import settings from "../../package.json";
import { postNewCommentApi } from "../api/CommentsApi";
import {
  getChatNotificationApi,
  getCommentsNotificationApi,
} from "../api/NotificationsApi";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import avatar1 from "../assets/images/avatar1.png";
import avatar2 from "../assets/images/avatar2.png";
import avatar3 from "../assets/images/avatar3.png";
import avatar4 from "../assets/images/avatar4.png";

function ProfileSection() {
  // 1) Data
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const User = useSelector((state) => state.User.value);
  const Nav = useSelector((state) => state.Navigation.value);
  const [commentsNotifications, setcommentsNotifications] = useState(0);
  const [chatNotifications, setchatNotifications] = useState(0);
  const [firstload, setfirstload] = useState(true);
  const [avatarNumber, setavatarNumber] = useState(0);

  // 2) UseEffects

  useEffect(() => {
    if (firstload) {
      setfirstload(false);
      getCommentsNotificationsFunction();
      getChatNotificationsFunction();
      //console.log("User Number :", User.User);
    }
    let time = settings["appSettings :"].notificationsTime;
    const interval = setInterval(() => {
      getCommentsNotificationsFunction();
      getChatNotificationsFunction();
    }, time * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!firstload) {
      //console.log("Called From Update");

      setTimeout(function () {
        getCommentsNotificationsFunction();
        getChatNotificationsFunction();
      }, 500);
    }
    return;
  }, [Nav.Update]);

  // 3) Functions
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logoutFunction = () => {
    dispatch(redux_resetNavigation());
    dispatch(redux_resetUser());
    navigate("/");
  };

  const getCommentsNotificationsFunction = async () => {
    try {
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await getCommentsNotificationApi(url, token);
      const data = await response.json();

      //console.log("Notifications :", data.response);

      if (data?.resultCode === 0) {
        let comments_notification = data?.response?.unreadCountSum;
        if (comments_notification != 0) {
          let int = parseInt(comments_notification);
          setcommentsNotifications(int);
        } else {
          setcommentsNotifications(0);
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
          setchatNotifications(int);
        } else {
          setchatNotifications(0);
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

  const navigateToPosts = () => {
    if (window.location.hash == "#/News") {
      window.location.reload();
    } else {
      navigate("/News");
    }
  };

  const navigateToMessages = () => {
    if (window.location.hash == "#/Messages") {
      window.location.reload();
    } else {
      navigate("/Messages");
    }
  };

  return (
    <div>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
        style={{ padding: 0 }}
      >
        <Badge
          badgeContent={commentsNotifications + chatNotifications}
          color="primary"
        >
          {User.User.avatar == 1 && <Avatar alt="Avatar" src={avatar1} />}
          {User.User.avatar == 2 && <Avatar alt="Avatar" src={avatar2} />}
          {User.User.avatar == 3 && <Avatar alt="Avatar" src={avatar3} />}
          {User.User.avatar == 4 && <Avatar alt="Avatar" src={avatar4} />}
        </Badge>
      </IconButton>

      {/* Menu Dropdown */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {/* User */}
        <MenuItem
          onClick={handleClose}
          style={{ color: "#4b5565", fontSize: 15 }}
        >
          <AccountCircleIcon
            size={18}
            color="#4b5565"
            style={{ marginRight: 5 }}
          />
          {User.User.firstName + " " + User.User.lastName}
        </MenuItem>
        <Divider />

        {/* Messages */}
        <MenuItem
          onClick={navigateToMessages}
          style={{ color: "#4b5565", fontSize: 15 }}
        >
          <IoIosNotifications
            size={20}
            style={
              chatNotifications > 0
                ? { color: "#d62828" }
                : { marginRight: 5, color: "#4b5565" }
            }
          />{" "}
          {chatNotifications == 1
            ? chatNotifications + " Νέο μήνυμα"
            : chatNotifications + " Νέα μηνύματα"}
        </MenuItem>

        {/* COMMENTS */}
        <MenuItem
          onClick={navigateToPosts}
          style={{ color: "#4b5565", fontSize: 15 }}
        >
          <IoIosNotifications
            size={20}
            style={
              commentsNotifications > 0
                ? { color: "#d62828" }
                : { marginRight: 5, color: "#4b5565" }
            }
          />{" "}
          {commentsNotifications == 1
            ? commentsNotifications + " Νέο σχόλιο"
            : commentsNotifications + " Νέα σχόλια"}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={logoutFunction}
          style={{ color: "#4b5565", fontSize: 15 }}
        >
          {" "}
          <BiLogOut size={18} color="#4b5565" style={{ marginRight: 5 }} />{" "}
          Αποσύνδεση
        </MenuItem>
      </Menu>
    </div>
  );
}

export default ProfileSection;
