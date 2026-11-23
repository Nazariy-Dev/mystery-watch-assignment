import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REHYDRATE } from 'redux-persist';

import { env } from '@/shared/config';

import { mockFetch } from './mock-backend';

export const PERSIST_ROOT_KEY = 'root';

/** Empty API that entities extend with `injectEndpoints`; one cache, one middleware. */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: env.apiBaseUrl, fetchFn: mockFetch }),
  tagTypes: ['Player'],
  // Restores only fulfilled cache entries from redux-persist, so a cold start shows the last
  // known catalogue and wallet instantly while fresh data loads in the background.
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE && action.key === PERSIST_ROOT_KEY) {
      // The persisted slice has this reducer's own shape; `never` lets it satisfy the return type.
      const payload = action.payload as Record<string, never> | undefined;
      return payload?.[reducerPath];
    }
  },
  endpoints: () => ({}),
});
