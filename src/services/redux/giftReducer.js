import { createSlice } from "@reduxjs/toolkit";

const glGift = createSlice({
  name: "gift reducer",
  initialState: { dtGift: {} },
  reducers: {
    setGlGift: (state, action) => {
      state.dtGift = action.payload;
    },
  },
});

export const { setGlGift } = glGift.actions;
export default glGift.reducer;
