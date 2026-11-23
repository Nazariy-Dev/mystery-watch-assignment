import { createMMKV } from 'react-native-mmkv';

import type { Me } from '../contract';
import { mockBackendConfig } from './config';

const STATE_KEY = 'state';

// Separate from the Redux persist store: this plays the server's database, the source of truth.
const storage = createMMKV({ id: 'mock-backend' });

export function readState(): Me {
  const raw = storage.getString(STATE_KEY);
  return raw ? (JSON.parse(raw) as Me) : { balance: mockBackendConfig.startingBalance, inventory: [] };
}

export function writeState(state: Me) {
  storage.set(STATE_KEY, JSON.stringify(state));
}

export function resetState(): Me {
  storage.remove(STATE_KEY);
  return readState();
}
