import { createSlice } from "@reduxjs/toolkit";

const glDtOrientation = createSlice({
  name: "orientation reducer",
  initialState: { dtLandscape: true },
  reducers: {
    setGlDtOritentation: (state, action) => {
      state.dtLandscape = action.payload;
    },
  },
});

export const { setGlDtOritentation } = glDtOrientation.actions;
export default glDtOrientation.reducer;
