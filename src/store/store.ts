import { configureStore } from '@reduxjs/toolkit';
import petReducer from './petSlice';
import { savePet } from '../storage/persistant';
export const store = configureStore({
  reducer: {
    pet: petReducer,
  },
});
store.subscribe(() => {
  savePet(store.getState().pet);
});
export type RootState = ReturnType<
  typeof store.getState
>;

export type AppDispatch =
  typeof store.dispatch;