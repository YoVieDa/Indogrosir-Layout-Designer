// store.js
import { configureStore } from "@reduxjs/toolkit";
import registryReduce from "./registryReducer";
import userReduce from "./userReducer";
import ipReducer from "./ipReducer";

const store = configureStore({
  reducer: {
    glRegistry: registryReduce,
    glUser: userReduce,
    glDtIp: ipReducer,
  },
});

console.log("on Create store: ", store.getState());

store.subscribe(() => {
  console.log("Store Change: ", store.getState());
});

export default store;
