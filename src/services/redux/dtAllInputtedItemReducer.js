import { createSlice } from "@reduxjs/toolkit";

const glDtAllInputtedItem = createSlice({
  name: "Dt All Inputted Item reducer",
  initialState: { glDtAllInputtedItem: [], glDtHitungTotal: [] },
  reducers: {
    // Reducer untuk menambah item baru ke dalam array
    addItem: (state, action) => {
      state.glDtAllInputtedItem.push(action.payload);
    },

    replaceArray: (state, action) => {
      state.glDtAllInputtedItem = action.payload;
    },

    // Reducer untuk memperbarui item berdasarkan id
    updateItem: (state, action) => {
      const index = state.glDtAllInputtedItem.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.glDtAllInputtedItem[index] = action.payload;
      }
    },

    // Reducer untuk menghapus item berdasarkan id (misalnya)
    removeItem: (state, action) => {
      state.glDtAllInputtedItem = state.glDtAllInputtedItem.filter(
        (item) => item.plu !== action.payload.plu
      );
    },
    // Reducer untuk hapus semua item
    removeAllItems: (state) => {
      state.glDtAllInputtedItem = [];
    },

    // Reducer untuk menambah item baru ke dalam array
    addItemHitungTotal: (state, action) => {
      state.glDtHitungTotal.push(action.payload);
    },

    replaceArrayHitungTotal: (state, action) => {
      state.glDtHitungTotal = action.payload;
    },

    // Reducer untuk memperbarui item berdasarkan id
    updateItemHitungTotal: (state, action) => {
      const index = state.glDtHitungTotal.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.glDtHitungTotal[index] = action.payload;
      }
    },
    // Reducer untuk menghapus item berdasarkan id (misalnya)
    removeItemHitungTotal: (state, action) => {
      state.glDtHitungTotal = state.glDtHitungTotal.filter(
        (item) => item.id !== action.payload.id
      );
    },
    // Reducer untuk hapus semua item
    removeAllItemsHitungTotal: (state) => {
      state.glDtHitungTotal = [];
    },
  },
});

export const {
  addItem,
  replaceArray,
  removeItem,
  removeAllItems,
  updateItem,
  addItemHitungTotal,
  replaceArrayHitungTotal,
  updateItemHitungTotal,
  removeItemHitungTotal,
  removeAllItemsHitungTotal,
} = glDtAllInputtedItem.actions;
export default glDtAllInputtedItem.reducer;
