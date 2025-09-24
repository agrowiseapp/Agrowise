import { Grid, Typography } from "@mui/material";
import React from "react";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";

function ModalHeader({ action }) {
  return (
    <React.Fragment>
      <Grid
        container
        pt={1}
        pb={1}
        px={3}
        style={{
          display: "flex",
          alignItems: "center",
          color: "gray",
          cursor: "pointer",
          justifyContent: "center",
        }}
        onClick={action}
      >
        <KeyboardReturnIcon />
        <Typography variant="h4"> Επιστροφή</Typography>
      </Grid>
    </React.Fragment>
  );
}

export default ModalHeader;
