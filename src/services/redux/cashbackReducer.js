import { createSlice } from "@reduxjs/toolkit";

const glCashBack = createSlice({
  name: "cashback reducer",
  initialState: { dtCashBack: {} },
  reducers: {
    setGlCashBack: (state, action) => {
      state.dtCashBack = action.payload;
    },
  },
});

export const { setGlCashBack } = glCashBack.actions;
export default glCashBack.reducer;
