import { Grid } from "@mui/material";
import React from "react";
import ReportsCard from "../../components/reports/ReportsCard";
import withDrawer from "../../layout/withDrawer";

function Reports() {
  return (
    <Grid container spacing={3} p={3}>
      <Grid item xs={12}>
        <ReportsCard />
      </Grid>
    </Grid>
  );
}

export default withDrawer(Reports);
