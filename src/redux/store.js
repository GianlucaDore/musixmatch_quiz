import { configureStore } from '@reduxjs/toolkit';
import quizReducer from './quizSlice.js';

export const store = configureStore({
  reducer: {
    quiz: quizReducer
  }
});
