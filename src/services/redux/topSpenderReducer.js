import { createSlice } from "@reduxjs/toolkit";

const glDtTopSpender = createSlice({
  name: "top spender",
  initialState: { dtTopSpender: {} },
  reducers: {
    setGlDtTopSpender: (state, action) => {
      state.dtTopSpender = action.payload;
    },
  },
});

export const { setGlDtTopSpender } = glDtTopSpender.actions;
export default glDtTopSpender.reducer;
