import { Button, Grid, TextField } from "@mui/material";
import React, { useState } from "react";
import ChangeUser from "../../components/settings/ChangeUser";
import SettingsCard from "../../components/settings/SettingsCard";
import UsersCard from "../../components/settings/UsersCard";
import withDrawer from "../../layout/withDrawer";

function Settings() {
  // 1) Data

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <UsersCard />
          </Grid>
          <Grid item xs={12} md={4}>
            <Grid item xs={12} mb={3}>
              <SettingsCard />
            </Grid>
            <Grid item xs={12}>
              <ChangeUser />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default withDrawer(Settings);
