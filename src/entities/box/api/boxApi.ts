import { baseApi, type Box } from '@/shared/api';

export const boxApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBoxes: build.query<Box[], void>({ query: () => '/boxes' }),
    getBox: build.query<Box, string>({ query: (boxId) => `/boxes/${boxId}` }),
  }),
});

export const { useGetBoxesQuery, useGetBoxQuery } = boxApi;
