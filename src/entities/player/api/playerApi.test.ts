import { configureStore } from '@reduxjs/toolkit';

import { baseApi, mockBackendConfig } from '@/shared/api';

import { playerApi } from './playerApi';

// Batch on a microtask: the default animation-frame flush outlives Jest's environment under React Native's mocks.
const createStore = () =>
  configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    enhancers: (getDefaultEnhancers) => getDefaultEnhancers({ autoBatch: { type: 'tick' } }),
  });

beforeEach(async () => {
  Object.assign(mockBackendConfig, { minLatencyMs: 0, maxLatencyMs: 0, failureRate: 0, random: () => 0 });
  await createStore().dispatch(playerApi.endpoints.resetDemo.initiate());
});

const selectMe = (store: ReturnType<typeof createStore>) =>
  playerApi.endpoints.getMe.select()(store.getState()).data;

// The coin counter and collection must reflect a purchase immediately, without waiting on a refetch.
test('opening a box updates the cached wallet and collection from the response', async () => {
  const store = createStore();
  await store.dispatch(playerApi.endpoints.getMe.initiate());
  const before = selectMe(store)!;

  const result = await store.dispatch(playerApi.endpoints.openBox.initiate('starter-drop')).unwrap();

  expect(selectMe(store)).toEqual({ balance: result.balance, inventory: [result.item, ...before.inventory] });
  expect(result.balance).toBeLessThan(before.balance);
});

// Selling must credit the wallet and drop the watch from the vault in the same render.
test('selling a watch updates the cached wallet and collection from the response', async () => {
  const store = createStore();
  await store.dispatch(playerApi.endpoints.getMe.initiate());
  const opened = await store.dispatch(playerApi.endpoints.openBox.initiate('starter-drop')).unwrap();

  const sold = await store.dispatch(playerApi.endpoints.sellItem.initiate(opened.item.id)).unwrap();

  expect(selectMe(store)).toEqual({ balance: sold.balance, inventory: [] });
});

// A failed purchase must leave the visible wallet exactly as it was.
test('a failed open leaves the cached wallet unchanged', async () => {
  const store = createStore();
  await store.dispatch(playerApi.endpoints.getMe.initiate());
  const before = selectMe(store);
  mockBackendConfig.failureRate = 1;

  const result = await store.dispatch(playerApi.endpoints.openBox.initiate('starter-drop'));
  mockBackendConfig.failureRate = 0;

  expect(result.error).toMatchObject({ status: 503 });
  expect(selectMe(store)).toEqual(before);
});
