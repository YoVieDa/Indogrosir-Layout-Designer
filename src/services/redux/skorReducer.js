import { createSlice } from "@reduxjs/toolkit";

const glDtInfoSkor = createSlice({
  name: "skor reducer",
  initialState: { dtInfoSkor: {} },
  reducers: {
    setGlDtInfoSkor: (state, action) => {
      state.dtInfoSkor = action.payload;
    },
  },
});

export const { setGlDtInfoSkor } = glDtInfoSkor.actions;
export default glDtInfoSkor.reducer;
