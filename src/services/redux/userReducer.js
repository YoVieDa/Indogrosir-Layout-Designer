import { createSlice } from "@reduxjs/toolkit";

const glDataUser = createSlice({
  name: "user data",
  initialState: { dtUser: {}, userModul: "", stationModul: "", namaModul: "" },
  reducers: {
    setGlDataUser: (state, action) => {
      state.dtUser = action.payload;
    },

    setGlDataUserModul: (state, action) => {
      state.userModul = action.payload;
    },

    setGlDataStationModul: (state, action) => {
      state.stationModul = action.payload;
    },

    setGlDataNamaModul: (state, action) => {
      state.namaModul = action.payload;
    },
  },
});

export const {
  setGlDataUser,
  setGlDataUserModul,
  setGlDataStationModul,
  setGlDataNamaModul,
} = glDataUser.actions;
export default glDataUser.reducer;
