import { Typography } from "@mui/material";
import React from "react";
import logoImage from "../../assets/images/logo-no-background.png";
import { styled, useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { redux_Navigation } from "../../redux/Navigation";
import { useNavigate } from "react-router-dom";

function Logo() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navigateToMainScreen = () => {
    navigate("/Dashboard");

    dispatch(
      redux_Navigation({
        Page: "Κύρια Σελίδα",
      })
    );
  };

  return (
    <div className="text-center">
      <img
        src={logoImage}
        width="200"
        style={{
          background: theme.palette.primary.light,
          padding: "20px 10px",
          borderRadius: 10,
          cursor: "pointer",
        }}
        onClick={navigateToMainScreen}
      />
      <Typography
        style={{ marginTop: 10, color: theme.palette.primary.dark }}
        variant="h4"
      ></Typography>
    </div>
  );
}

export default Logo;
