import { combineReducers, configureStore } from '@reduxjs/toolkit';
import quizReducer from './quizSlice.js';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';  // To make the store compatible with async thunks and prevent "non-serializable value" error


const persistConfig = {
  key: "root",
  storage
}

const combinedReducer = combineReducers({
  quiz: quizReducer,
});

const persistedReducer = persistReducer(persistConfig, combinedReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk]
});
