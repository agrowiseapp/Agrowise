import { createSlice } from "@reduxjs/toolkit";

const initialStateValue = {
  User: null,
  Token: null,
};

export const User = createSlice({
  name: "User",
  initialState: {
    value: initialStateValue,
  },
  reducers: {
    redux_User: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
    redux_resetUser: (state) => {
      state.value = initialStateValue;
    },
  },
});
export const { redux_User, redux_resetUser } = User.actions;

export default User.reducer;
