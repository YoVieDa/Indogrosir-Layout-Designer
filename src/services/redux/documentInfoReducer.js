import { createSlice } from "@reduxjs/toolkit";

const glDocInfo = createSlice({
  name: "document trx info reducer",
  initialState: { info: "", timeStart: "" },
  reducers: {
    addDtInfo: (state, action) => {
      state.info = action.payload;
    },
    removeDtInfoItem: (state, action) => {
      state.info = state.info.filter((item) => item.id !== action.payload.id);
    },

    addDtTimeStart: (state, action) => {
      state.timeStart = action.payload;
    },
    removeDtTimeStart: (state, action) => {
      state.timeStart = state.timeStart.filter(
        (item) => item.id !== action.payload.id
      );
    },
  },
});

export const {
  addDtInfo,
  removeDtInfoItem,
  addDtTimeStart,
  removeDtTimeStart,
} = glDocInfo.actions;
export default glDocInfo.reducer;
