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

function UserAvatar({ num, w, h }) {
  return (
    <React.Fragment>
      {num == 1 && (
        <Avatar
          alt="Avatar"
          src={avatar1}
          style={{ height: h, width: w, marginRight: 5 }}
        />
      )}
      {num == 2 && (
        <Avatar
          alt="Avatar"
          src={avatar2}
          style={{ height: h, width: w, marginRight: 5 }}
        />
      )}
      {num == 3 && (
        <Avatar
          alt="Avatar"
          src={avatar3}
          style={{ height: h, width: w, marginRight: 5 }}
        />
      )}
      {num == 4 && (
        <Avatar
          alt="Avatar"
          src={avatar4}
          style={{ height: h, width: w, marginRight: 5 }}
        />
      )}
      {num == 5 && (
        <Avatar
          alt="Avatar"
          src={avatar5}
          style={{ height: h, width: w, marginRight: 5 }}
        />
      )}{" "}
      {num == 6 && (
        <Avatar
          alt="Avatar"
          src={avatar6}
          style={{ height: h, width: w, marginRight: 5 }}
        />
      )}{" "}
      {num == 7 && (
        <Avatar
          alt="Avatar"
          src={avatar7}
          style={{ height: h, width: w, marginRight: 5 }}
        />
      )}{" "}
      {num == 8 && (
        <Avatar
          alt="Avatar"
          src={avatar8}
          style={{ height: h, width: w, marginRight: 5 }}
        />
      )}
    </React.Fragment>
  );
}

export default UserAvatar;
