import { configureStore } from "@reduxjs/toolkit";
import classReducer from "./reducers/classes";
import reserveReducer from "./reducers/reserveSlots";
import schedulesReducer from "./reducers/schedules";

export const store = configureStore({
  reducer: {
    reserve: reserveReducer,
    class: classReducer,
    schedules: schedulesReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
