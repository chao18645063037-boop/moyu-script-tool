import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import projectReducer from './projectSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
