import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import taskReducer from './slices/taskSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
  },
});