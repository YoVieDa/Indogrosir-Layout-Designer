import { createSlice } from "@reduxjs/toolkit";

const glDtRegistry = createSlice({
  name: "registry",
  initialState: {
    dtEncryptedRegistry: {},
    dtDecryptedRegistry: {},
    dtGatewayURL: "",
    shiftState: false,
    flagClosing: false,
  },
  reducers: {
    setGlDtEncryptedRegistry: (state, action) => {
      state.dtEncryptedRegistry = action.payload;
    },
    setGlDtDecryptedRegistry: (state, action) => {
      // state.dtDecryptedRegistry.push(action.payload);
      state.dtDecryptedRegistry = action.payload;
    },
    setGlDtGatewayURL: (state, action) => {
      // state.dtDecryptedRegistry.push(action.payload);
      state.dtGatewayURL = action.payload;
    },
    setGlDtShift: (state, action) => {
      // state.dtDecryptedRegistry.push(action.payload);
      state.shiftState = action.payload;
    },
    setFlagClosing: (state, action) => {
      state.flagClosing = action.payload;
    },
  },
});

export const {
  setGlDtEncryptedRegistry,
  setGlDtDecryptedRegistry,
  setGlDtGatewayURL,
  setGlDtShift,
  setFlagClosing,
} = glDtRegistry.actions;
export default glDtRegistry.reducer;
