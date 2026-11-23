import { API_BASE_URL } from '@/shared/config';

import { mockFetch } from './index';

// The app has no real backend: every screen depends on these requests being answered locally.
test('answers a known route on the fake API origin', async () => {
  const res = await mockFetch(new Request(`${API_BASE_URL}/health`));

  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
});

// A typo'd endpoint must fail loudly instead of hanging or returning empty data.
test('returns 404 for an unknown route', async () => {
  const res = await mockFetch(new Request(`${API_BASE_URL}/nope`, { method: 'POST' }));

  expect(res.status).toBe(404);
});
