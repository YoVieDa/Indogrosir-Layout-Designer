// store.js
import { configureStore } from "@reduxjs/toolkit";
import memberReduce from "./memberReducer";
import registryReduce from "./registryReducer";
import counterReduce from "./counterReducer";
import userReduce from "./userReducer";
import topSpenderReducer from "./topSpenderReducer";
import skorReducer from "./skorReducer";
import pulsaReducer from "./pulsaReducer";
import giftReducer from "./giftReducer";
import cashbackReducer from "./cashbackReducer";
import ipReducer from "./ipReducer";
import orientationReducer from "./orientationReducer";
import dtAllInputtedItemReducer from "./dtAllInputtedItemReducer";
import dtDocInfo from "./documentInfoReducer";
import dtForPwpReducer from "./dtForPwpReducer";

const store = configureStore({
  reducer: {
    memberState: memberReduce,
    glRegistry: registryReduce,
    glCounter: counterReduce,
    glUser: userReduce,
    glTopSpender: topSpenderReducer,
    glInfoSkor: skorReducer,
    glDtInfoPulsa: pulsaReducer,
    glDtGift: giftReducer,
    glDtCashBack: cashbackReducer,
    glDtIp: ipReducer,
    glDtOrientation: orientationReducer,
    glDtAllInputtedItem: dtAllInputtedItemReducer,
    glDocInfo: dtDocInfo,
    glDtForPwp: dtForPwpReducer,
  },
});

console.log("on Create store: ", store.getState());

store.subscribe(() => {
  console.log("Store Change: ", store.getState());
});

export default store;
