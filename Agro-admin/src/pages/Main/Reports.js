import { Grid } from "@mui/material";
import React from "react";
import EnhancedReportsCard from "../../components/reports/EnhancedReportsCard";
import withDrawer from "../../layout/withDrawer";

function Reports() {
  return (
    <Grid container spacing={3} p={3}>
      <Grid item xs={12}>
        <EnhancedReportsCard />
      </Grid>
    </Grid>
  );
}

export default withDrawer(Reports);
