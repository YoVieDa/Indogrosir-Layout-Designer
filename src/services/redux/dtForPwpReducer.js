import { createSlice } from "@reduxjs/toolkit";

const glDtForPwp = createSlice({
  name: "Dt All Inputted Item reducer",
  initialState: { glDtForPwp: [], glPembulatan: 0 },
  reducers: {
    replaceArrayDtPwp: (state, action) => {
      state.glDtForPwp = action.payload;
    },

    addItemDtPwp: (state, action) => {
      state.glDtForPwp = action.payload;
    },

    setGlPembulatan: (state, action) => {
      state.glPembulatan = action.payload;
    },
  },
});

export const { replaceArrayDtPwp, addItemDtPwp, setGlPembulatan } =
  glDtForPwp.actions;
export default glDtForPwp.reducer;
