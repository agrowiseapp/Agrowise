import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    messages: [],
    unreadCount: 0,
  },
};

export const GroupChatSlice = createSlice({
  name: "GroupChat",
  initialState,
  reducers: {
    redux_setGroupChatMessages: (state, action) => {
      state.value.messages = action.payload;
    },
    redux_setUnreadCount: (state, action) => {
      state.value.unreadCount = action.payload;
    },
    redux_clearGroupChat: (state) => {
      state.value = initialState.value;
    },
  },
});

export const {
  redux_setGroupChatMessages,
  redux_setUnreadCount,
  redux_clearGroupChat,
} = GroupChatSlice.actions;

export default GroupChatSlice.reducer;
