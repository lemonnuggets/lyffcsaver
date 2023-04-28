import { Schedule, SchedulesBySlotCombination } from "@/types";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface SchedulesState {
  schedules: SchedulesBySlotCombination;
  selectedSlotCombination: Array<string>;
  currentSchedule: Schedule;
}

const initialState: SchedulesState = {
  schedules: {},
  selectedSlotCombination: [],
  currentSchedule: {},
};

export const schedulesSlice = createSlice({
  name: "schedules",
  initialState,
  reducers: {
    setSchedules: (
      state,
      action: PayloadAction<SchedulesBySlotCombination>
    ) => {
      state.schedules = action.payload;
    },
    clearSchedules: (state) => {
      state.schedules = {};
    },
    populateSchedulesAndSelectSlotCombination: (
      state,
      action: PayloadAction<{
        slotCombination: Array<string>;
        schedulesArray: Array<Schedule>;
      }>
    ) => {
      const { slotCombination, schedulesArray } = action.payload;
      state.schedules[slotCombination.join("+")] = schedulesArray;
      state.selectedSlotCombination = slotCombination;
      state.schedules = { ...state.schedules };
    },
    deselectSlotCombination: (state) => {
      state.selectedSlotCombination = [];
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setSchedules,
  populateSchedulesAndSelectSlotCombination,
  clearSchedules,
  deselectSlotCombination,
} = schedulesSlice.actions;

export default schedulesSlice.reducer;
