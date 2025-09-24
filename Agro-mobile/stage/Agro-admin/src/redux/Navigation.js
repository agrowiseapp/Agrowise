import { createSlice } from "@reduxjs/toolkit";

const initialStateValue = {
  Page: "Kύρια Σελίδα",
  Update: "",
};

export const Navigation = createSlice({
  name: "Navigation",
  initialState: {
    value: initialStateValue,
  },
  reducers: {
    redux_Navigation: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
    redux_resetNavigation: (state) => {
      state.value = initialStateValue;
    },
  },
});
export const { redux_Navigation, redux_resetNavigation } = Navigation.actions;

export default Navigation.reducer;
