import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadPet } from '../storage/persistant';

export interface PetState {
  hunger: number;
  happiness: number;
  energy: number;

  coins: number;
  level: number;
  xp: number;

  lastOpened: number;
}
const loadedPet = loadPet();
const initialState: PetState = loadedPet ? loadedPet : {
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
      if (state.hunger >= 100) {
        return;
      }
      state.hunger = clamp(state.hunger + 20);
      state.happiness = clamp(state.happiness + 4);
      state.energy = clamp(state.energy + 2);

      state.xp += 6;
      handleLevelUp(state);
    },

    playPet: state => {
      if (state.energy <= 0) {
        return;
      }
      state.happiness = clamp(state.happiness + 20);
      state.energy = clamp(state.energy - 12);
      state.hunger = clamp(state.hunger - 6);

      state.coins += 5;
      state.xp += 8;
      handleLevelUp(state);
    },

    sleepPet: state => {
      if (state.energy >= 100) {
        return;
      }
      state.energy = clamp(state.energy + 25);
      state.hunger = clamp(state.hunger - 8);
      state.happiness = clamp(state.happiness + 3);

      state.xp += 4;
      handleLevelUp(state);
    },

    decayStats: state => {
      if (state.hunger <= 0 || state.happiness <= 0 || state.energy <= 0) {
        return;
      }
      state.hunger = clamp(state.hunger - 1);
      state.happiness = clamp(state.happiness - 1);
      state.energy = clamp(state.energy - 1);
      handleLevelUp(state);
    },

    setLastOpened: (
      state,
      action: PayloadAction<number>,
    ) => {
      state.lastOpened = action.payload;
    },
    applyOfflineDecay: (
      state,
      action
    ) => {
      const elapsedMinutes =
        action.payload;
    
      const decay =
        Math.min(
          elapsedMinutes * 5,
          40
        );
    
      state.hunger =
        clamp(state.hunger - decay);
    
      state.energy =
        clamp(state.energy - decay);
    
      state.happiness =
        clamp(state.happiness - decay);
    }
   
  },
});

const handleLevelUp = (state: PetState) => {
  while (state.xp >= 100) {
    state.xp -= 100;
    state.level += 1;
    state.coins += 25;
  }
};
export const getMood = (
  state: PetState,
) => {
  const values = [
    state.hunger,
    state.happiness,
    state.energy,
  ];

  if (values.some(v => v < 35))
    return 'sad';

  if (values.every(v => v >= 70))
    return 'happy';

  return 'neutral';
};
export const {
  feedPet,
  playPet,
  sleepPet,
  decayStats,
  setLastOpened,
  applyOfflineDecay
} = petSlice.actions;

export default petSlice.reducer;