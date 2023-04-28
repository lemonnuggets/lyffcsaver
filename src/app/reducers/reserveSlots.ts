import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface ReserveSlotsState {
  reservedSlots: Array<string>;
}

const initialState: ReserveSlotsState = {
  reservedSlots: [],
};

export const reserveSlice = createSlice({
  name: "reserve",
  initialState,
  reducers: {
    toggleReserve: (state, action: PayloadAction<string>) => {
      const index = state.reservedSlots.indexOf(action.payload);
      if (index > -1) {
        state.reservedSlots.splice(index, 1);
      } else {
        state.reservedSlots.push(action.payload);
      }
    },
    clearReserved: (state) => {
      state.reservedSlots = [];
    },
  },
});

// Action creators are generated for each case reducer function
export const { toggleReserve, clearReserved } = reserveSlice.actions;

export default reserveSlice.reducer;
