import { createSlice } from "@reduxjs/toolkit";

const glDtInfoPulsa = createSlice({
  name: "pulsa reducer",
  initialState: { dtPulsa: {}, dtData: {}, imgProvider: "", providerName: "" },
  reducers: {
    setGlDtPulsa: (state, action) => {
      state.dtPulsa = action.payload;
    },
    setGlDtData: (state, action) => {
      state.dtData = action.payload;
    },
    setGlImgProvider: (state, action) => {
      state.imgProvider = action.payload;
    },
    setGlProviderName: (state, action) => {
      state.providerName = action.payload;
    },
  },
});

export const {
  setGlDtPulsa,
  setGlDtData,
  setGlImgProvider,
  setGlProviderName,
} = glDtInfoPulsa.actions;
export default glDtInfoPulsa.reducer;
