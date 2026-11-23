import { createMMKV } from 'react-native-mmkv';
import type { Storage } from 'redux-persist';

const reduxStorage = createMMKV({ id: 'redux-persist' });

/** redux-persist adapter over MMKV; MMKV is synchronous, so the promises resolve immediately. */
export const persistStorage: Storage = {
  getItem: (key: string) => Promise.resolve(reduxStorage.getString(key) ?? null),
  setItem: (key: string, value: string) => {
    reduxStorage.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    reduxStorage.remove(key);
    return Promise.resolve();
  },
};
