import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import NavigationReducer from "../Navigation";
import UserReducer from "../User";
import ReportsReducer from "../Reports";
import GroupChatReducer from "../GroupChat";

const reducers = combineReducers(
  {
    Navigation: NavigationReducer,
    User: UserReducer,
    Reports: ReportsReducer,
    GroupChat: GroupChatReducer,
  },
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: [thunk],
});

export default store;
