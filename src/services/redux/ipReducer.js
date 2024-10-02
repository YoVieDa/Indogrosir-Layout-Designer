import { createSlice } from "@reduxjs/toolkit";

const glDtIp = createSlice({
  name: "ip reducer",
  initialState: { dtIp: {} },
  reducers: {
    setGlDtIp: (state, action) => {
      state.dtIp = action.payload;
    },
  },
});

export const { setGlDtIp } = glDtIp.actions;
export default glDtIp.reducer;
