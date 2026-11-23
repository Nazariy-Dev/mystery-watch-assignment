import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';

import { baseApi, PERSIST_ROOT_KEY } from '@/shared/api';
import { persistStorage } from '@/shared/lib';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
});

const persistedReducer = persistReducer(
  { key: PERSIST_ROOT_KEY, storage: persistStorage, whitelist: [baseApi.reducerPath] },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // redux-persist dispatches non-serializable callbacks in these actions by design.
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);
