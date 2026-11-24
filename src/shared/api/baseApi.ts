import { createApi, fetchBaseQuery, retry, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { REHYDRATE } from 'redux-persist';

import { env } from '@/shared/config';

import { mockFetch } from './mock-backend';

export const PERSIST_ROOT_KEY = 'root';
const MAX_READ_RETRIES = 2;
/** Cached data older than this refetches when a screen using it mounts; covers the cache restored at launch. */
const STALE_AFTER_SECONDS = 30;

/** Empty API that entities extend with `injectEndpoints`; one cache, one middleware. */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: retry(fetchBaseQuery({ baseUrl: env.apiBaseUrl, fetchFn: mockFetch }), {
    // Reads retry a failed or unreachable server; writes never do, as a purchase must not run twice.
    retryCondition: (error, _args, { attempt, baseQueryApi }) => {
      const { status } = error as FetchBaseQueryError;
      return baseQueryApi.type === 'query' && attempt <= MAX_READ_RETRIES && (typeof status !== 'number' || status >= 500);
    },
  }),
  refetchOnMountOrArgChange: STALE_AFTER_SECONDS,
  tagTypes: ['Player'],
  // Restores only completed cache entries from redux-persist, so a cold start shows the last
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
