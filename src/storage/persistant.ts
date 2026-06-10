import { storage } from './mmkv';

export const savePet = (state: any) => {
  storage.set(
    'pet_state',
    JSON.stringify(state),
  );
};
export const loadPet = () => {
    const data =
      storage.getString('pet_state');
  
    if (!data) {
      return null;
    }
  
    return JSON.parse(data);
  };