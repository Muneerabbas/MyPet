import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PetState {
  hunger: number;
  happiness: number;
  energy: number;

  coins: number;
  level: number;
  xp: number;

  lastOpened: number;
}

const initialState: PetState = {
  hunger: 70,
  happiness: 80,
  energy: 90,

  coins: 120,
  level: 3,
  xp: 75,

  lastOpened: Date.now(),
};

const clamp = (value: number) =>
  Math.max(0, Math.min(100, value));

const petSlice = createSlice({
  name: 'pet',

  initialState,

  reducers: {
    feedPet: state => {
      state.hunger = clamp(state.hunger + 20);
      state.happiness = clamp(state.happiness + 4);
      state.energy = clamp(state.energy + 2);

      state.xp += 6;
    },

    playPet: state => {
      state.happiness = clamp(state.happiness + 20);
      state.energy = clamp(state.energy - 12);
      state.hunger = clamp(state.hunger - 6);

      state.coins += 5;
      state.xp += 8;
    },

    sleepPet: state => {
      state.energy = clamp(state.energy + 25);
      state.hunger = clamp(state.hunger - 8);
      state.happiness = clamp(state.happiness + 3);

      state.xp += 4;
    },

    decayStats: state => {
      state.hunger = clamp(state.hunger - 1);
      state.happiness = clamp(state.happiness - 1);
      state.energy = clamp(state.energy - 1);
    },

    setLastOpened: (
      state,
      action: PayloadAction<number>,
    ) => {
      state.lastOpened = action.payload;
    },
  },
});

export const {
  feedPet,
  playPet,
  sleepPet,
  decayStats,
  setLastOpened,
} = petSlice.actions;

export default petSlice.reducer;