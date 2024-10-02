import { createSlice } from "@reduxjs/toolkit";

const glCounter = createSlice({
  name: "counter reducer",
  initialState: { glLogoutLimit: 40, glLogOutLimitApp: 40 },
  reducers: {
    setglLogoutLimit: (state, action) => {
      state.glLogoutLimit = action.payload;
    },
    setGlLogOutLimitApp: (state, action) => {
      // state.dtDecryptedRegistry.push(action.payload);
      state.glLogOutLimitApp = action.payload;
    },
  },
});

export const { setglLogoutLimit, setGlLogOutLimitApp } = glCounter.actions;
export default glCounter.reducer;
