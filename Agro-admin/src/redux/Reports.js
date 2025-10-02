import { createSlice } from "@reduxjs/toolkit";

const initialStateValue = {
  pendingReportsCount: 0,
};

export const Reports = createSlice({
  name: "Reports",
  initialState: {
    value: initialStateValue,
  },
  reducers: {
    redux_setPendingReportsCount: (state, action) => {
      state.value.pendingReportsCount = action.payload;
    },
    redux_resetReports: (state) => {
      state.value = initialStateValue;
    },
  },
});

export const { redux_setPendingReportsCount, redux_resetReports } = Reports.actions;

export default Reports.reducer;
