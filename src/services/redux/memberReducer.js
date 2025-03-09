import { createSlice } from "@reduxjs/toolkit";

const memberSlice = createSlice({
  name: "member",
  initialState: {
    memberMerah: true,
    memberUmum: false,
  },
  reducers: {
    toggleMemberMerah: (state) => {
      state.memberMerah = !state.memberMerah;
    },
    setFlagMemberUmum: (state, action) => {
      state.memberUmum = action.payload;
    },
  },
});

export const { toggleMemberMerah, setFlagMemberUmum } = memberSlice.actions;
export default memberSlice.reducer;
