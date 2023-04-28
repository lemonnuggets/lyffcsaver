import { Course, ExtendedClass } from "@/types";
import { getCourseID, isProject } from "@/utils/generalUtils";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface ClassesState {
  selectedClasses: {
    [courseID: string]: Array<ExtendedClass>;
  };
  stagedCourses: Array<Course>;
  selectedCourseID: string | null;
}

const initialState: ClassesState = {
  selectedClasses: {},
  stagedCourses: [],
  selectedCourseID: null,
};

export const classesSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {
    stageCourse: (state, action: PayloadAction<Course>) => {
      const courseID = getCourseID(action.payload);
      if (
        state.stagedCourses.find(
          (course) => getCourseID(course) === courseID
        ) === undefined
      ) {
        state.stagedCourses.push(action.payload);
        if (!isProject(action.payload)) {
          state.selectedCourseID = courseID;
          if (state.selectedClasses[courseID] === undefined) {
            state.selectedClasses[courseID] = [];
          }
        }
      }
    },
    unstageCourseByID: (state, action: PayloadAction<string>) => {
      const courseID = action.payload;
      const index = state.stagedCourses.findIndex(
        (course) => getCourseID(course) === courseID
      );
      if (index > -1) {
        state.stagedCourses.splice(index, 1);
        if (state.selectedClasses[courseID] !== undefined) {
          delete state.selectedClasses[courseID];
        }
        if (state.selectedCourseID === courseID) {
          if (state.stagedCourses.length > 0) {
            state.selectedCourseID = getCourseID(state.stagedCourses[0]);
          } else {
            state.selectedCourseID = null;
          }
        }
      }
    },
    unstageCourse: (state, action: PayloadAction<Course>) => {
      const courseID = getCourseID(action.payload);
      const index = state.stagedCourses.findIndex(
        (course) => getCourseID(course) === courseID
      );
      if (index > -1) {
        state.stagedCourses.splice(index, 1);
        if (state.selectedClasses[courseID] !== undefined) {
          delete state.selectedClasses[courseID];
        }
        if (state.selectedCourseID === courseID) {
          if (state.stagedCourses.length > 0) {
            state.selectedCourseID = getCourseID(state.stagedCourses[0]);
          } else {
            state.selectedCourseID = null;
          }
        }
      }
    },
    selectCourseByID: (state, action: PayloadAction<string>) => {
      const courseID = action.payload;
      if (isProject(courseID)) return;
      if (
        state.stagedCourses.find(
          (course) => getCourseID(course) === courseID
        ) === undefined
      )
        return;
      state.selectedCourseID = courseID;
    },
    selectCourse: (state, action: PayloadAction<Course>) => {
      const courseID = getCourseID(action.payload);
      if (isProject(action.payload)) return;
      if (
        state.stagedCourses.find(
          (course) => getCourseID(course) === courseID
        ) === undefined
      )
        return;
      state.selectedCourseID = courseID;
    },
    deselectCourse: (state) => {
      state.selectedCourseID = null;
    },
    addClassToCourse: (
      state,
      action: PayloadAction<{
        courseID: string;
        class: ExtendedClass;
      }>
    ) => {
      const { courseID, class: newClass } = action.payload;
      if (state.selectedClasses[courseID] === undefined) {
        state.selectedClasses[courseID] = [];
      }
      if (
        state.selectedClasses[courseID].findIndex(
          (c) => c["CLASS ID"] === newClass["CLASS ID"]
        ) > -1
      )
        return;
      state.selectedClasses[courseID].push(newClass);
    },
    addClassesToCourse: (
      state,
      action: PayloadAction<{
        courseID: string;
        classes: Array<ExtendedClass>;
      }>
    ) => {
      const { courseID, classes: newClasses } = action.payload;
      if (state.selectedClasses[courseID] === undefined) {
        state.selectedClasses[courseID] = [];
      }
      newClasses.forEach((newClass) => {
        if (
          state.selectedClasses[courseID].findIndex(
            (c) => c["CLASS ID"] === newClass["CLASS ID"]
          ) > -1
        )
          return;
        state.selectedClasses[courseID].push(newClass);
      });
    },
    removeClassFromSelectedCourse: (
      state,
      action: PayloadAction<ExtendedClass>
    ) => {
      if (state.selectedCourseID === null) return;
      state.selectedClasses[state.selectedCourseID] = state.selectedClasses[
        state.selectedCourseID
      ].filter((c) => c["CLASS ID"] !== action.payload["CLASS ID"]);
    },
    clearClassesFromSelectedCourse: (state) => {
      if (state.selectedCourseID === null) return;
      state.selectedClasses[state.selectedCourseID] = [];
    },
    setReorderedClasses: (
      state,
      action: PayloadAction<Array<ExtendedClass>>
    ) => {
      if (state.selectedCourseID === null) return;
      state.selectedClasses[state.selectedCourseID] = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  stageCourse,
  unstageCourse,
  unstageCourseByID,
  selectCourseByID,
  deselectCourse,
  addClassToCourse,
  removeClassFromSelectedCourse,
  selectCourse,
  setReorderedClasses,
  clearClassesFromSelectedCourse,
  addClassesToCourse,
} = classesSlice.actions;

export default classesSlice.reducer;
