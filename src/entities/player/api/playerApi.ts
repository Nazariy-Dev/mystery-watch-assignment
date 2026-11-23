import { baseApi, type Me, type OpenBoxResult, type SellItemResult } from '@/shared/api';

export const playerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<Me, void>({ query: () => '/me', providesTags: ['Player'] }),
    openBox: build.mutation<OpenBoxResult, string>({
      query: (boxId) => ({ url: `/boxes/${boxId}/open`, method: 'POST' }),
      // Apply the server's answer directly instead of refetching, so the balance and
      // collection update the moment the reveal starts.
      async onQueryStarted(_boxId, { dispatch, queryFulfilled }) {
        const result = await queryFulfilled.catch(() => null);
        // On failure the server changed nothing; the caller gets the error from the mutation.
        if (!result) return;
        dispatch(
          playerApi.util.updateQueryData('getMe', undefined, (me) => {
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
          playerApi.util.updateQueryData('getMe', undefined, (me) => {
            me.balance = result.data.balance;
            me.inventory = me.inventory.filter((item) => item.id !== itemId);
          }),
        );
      },
    }),
    resetDemo: build.mutation<Me, void>({
      query: () => ({ url: '/reset', method: 'POST' }),
      invalidatesTags: ['Player'],
    }),
  }),
});

export const { useGetMeQuery, useOpenBoxMutation, useSellItemMutation, useResetDemoMutation } = playerApi;
