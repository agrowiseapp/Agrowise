import { Avatar } from "@mui/material";
import React from "react";
import avatar1 from "../assets/images/avatar1.png";
import avatar2 from "../assets/images/avatar2.png";
import avatar3 from "../assets/images/avatar3.png";
import avatar4 from "../assets/images/avatar4.png";
import avatar5 from "../assets/images/avatar5.png";
import avatar6 from "../assets/images/avatar6.png";
import avatar7 from "../assets/images/avatar7.png";
import avatar8 from "../assets/images/avatar8.png";

function UserAvatar({ num, w, h, profilePicture }) {
  // Create mapping object for avatars
  const avatars = {
    1: avatar1,
    2: avatar2,
    3: avatar3,
    4: avatar4,
    5: avatar5,
    6: avatar6,
    7: avatar7,
    8: avatar8,
  };

  // Function to get avatar source - prioritize Google profile picture
  const getAvatarSource = () => {
    // If user has Google profile picture, use it
    if (profilePicture) {
      return profilePicture;
    }
    // Otherwise, fall back to numbered avatar
    return avatars[num] || avatars[1];
  };

  return (
    <Avatar
      alt="Avatar"
      src={getAvatarSource()}
      style={{ height: h, width: w, marginRight: 5 }}
    />
  );
}

export default UserAvatar;