import { createSlice } from "@reduxjs/toolkit";

const memberSlice = createSlice({
  name: "member",
  initialState: {
    memberMerah: true,
  },
  reducers: {
    toggleMemberMerah: (state) => {
      state.memberMerah = !state.memberMerah;
    },
  },
});

export const { toggleMemberMerah } = memberSlice.actions;
export default memberSlice.reducer;
