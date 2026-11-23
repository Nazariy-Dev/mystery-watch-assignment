import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REHYDRATE } from 'redux-persist';

import { API_BASE_URL } from '@/shared/config';

import type { Box, Me, OpenBoxResult, SellItemResult } from './contract';
import { mockFetch } from './mock-backend';

export const PERSIST_ROOT_KEY = 'root';

export const mysteryApi = createApi({
  reducerPath: 'mysteryApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL, fetchFn: mockFetch }),
  tagTypes: ['Me'],
  // Restores only fulfilled cache entries from redux-persist, so a cold start shows the last
  // known catalogue and wallet instantly while fresh data loads in the background.
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE && action.key === PERSIST_ROOT_KEY) {
      // The persisted slice has this reducer's own shape; `never` lets it satisfy the return type.
      const payload = action.payload as Record<string, never> | undefined;
      return payload?.[reducerPath];
    }
  },
  endpoints: (build) => ({
    getBoxes: build.query<Box[], void>({ query: () => '/boxes' }),
    getBox: build.query<Box, string>({ query: (boxId) => `/boxes/${boxId}` }),
    getMe: build.query<Me, void>({ query: () => '/me', providesTags: ['Me'] }),
    openBox: build.mutation<OpenBoxResult, string>({
      query: (boxId) => ({ url: `/boxes/${boxId}/open`, method: 'POST' }),
      // Apply the server's answer directly instead of refetching, so the balance and
      // collection update the moment the reveal starts.
      async onQueryStarted(_boxId, { dispatch, queryFulfilled }) {
        const result = await queryFulfilled.catch(() => null);
        // On failure the server changed nothing; the caller gets the error from the mutation.
        if (!result) return;
        dispatch(
          mysteryApi.util.updateQueryData('getMe', undefined, (me) => {
            me.balance = result.data.balance;
            me.inventory.unshift(result.data.item);
          }),
        );
      },
    }),
    sellItem: build.mutation<SellItemResult, string>({
      query: (itemId) => ({ url: `/inventory/${itemId}/sell`, method: 'POST' }),
      async onQueryStarted(itemId, { dispatch, queryFulfilled }) {
        const result = await queryFulfilled.catch(() => null);
        if (!result) return;
        dispatch(
          mysteryApi.util.updateQueryData('getMe', undefined, (me) => {
            me.balance = result.data.balance;
            me.inventory = me.inventory.filter((item) => item.id !== itemId);
          }),
        );
      },
    }),
    resetDemo: build.mutation<Me, void>({
      query: () => ({ url: '/reset', method: 'POST' }),
      invalidatesTags: ['Me'],
    }),
  }),
});

export const {
  useGetBoxesQuery,
  useGetBoxQuery,
  useGetMeQuery,
  useOpenBoxMutation,
  useSellItemMutation,
  useResetDemoMutation,
} = mysteryApi;
