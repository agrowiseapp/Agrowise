import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { useTheme } from "@emotion/react";

function Loader() {
  const theme = useTheme();
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
        <CircularProgress />
      </Box>
      <Typography
        variant="h5"
        style={{
          textAlign: "center",
          marginTop: 10,
          color: "#333",
        }}
      >
        Φωρτώνει..
      </Typography>
    </>
  );
}

export default Loader;
