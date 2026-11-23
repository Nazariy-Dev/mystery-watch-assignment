import { env } from '@/shared/config';

import type { Box, Me, OpenBoxResult, SellItemResult } from '../contract';

import { mockBackendConfig, mockFetch } from './index';

const call = async <T>(method: 'GET' | 'POST', path: string) => {
  const res = await mockFetch(`${env.apiBaseUrl}${path}`, { method });
  return { status: res.status, body: (await res.json()) as T };
};

const getMe = async () => (await call<Me>('GET', '/me')).body;

beforeEach(async () => {
  Object.assign(mockBackendConfig, { minLatencyMs: 0, maxLatencyMs: 0, failureRate: 0, random: () => 0 });
  await call('POST', '/reset');
});

// Buying is the core economy loop: the price must leave the wallet and the watch must land in it, together.
test('opening a box charges its price and adds the rolled watch', async () => {
  const before = await getMe();
  const { body: boxes } = await call<Box[]>('GET', '/boxes');
  const box = boxes[0];

  const { status, body } = await call<OpenBoxResult>('POST', `/boxes/${box.id}/open`);
  const after = await getMe();

  expect(status).toBe(200);
  expect(body.balance).toBe(before.balance - box.price);
  expect(after.balance).toBe(body.balance);
  expect(after.inventory).toEqual([body.item]);
  expect(box.contents.map((content) => content.watch.id)).toContain(body.item.watch.id);
});

// The client must never be able to overspend; the server is the authority on the balance.
test('opening a box the user cannot afford is rejected without side effects', async () => {
  const { body: boxes } = await call<Box[]>('GET', '/boxes');
  const priciest = boxes.reduce((max, box) => (box.price > max.price ? box : max));
  const before = await getMe();
  expect(before.balance).toBeLessThan(priciest.price);

  const { status } = await call('POST', `/boxes/${priciest.id}/open`);

  expect(status).toBe(402);
  expect(await getMe()).toEqual(before);
});

// A dropped connection mid-purchase must not cost coins; failures happen before any handler runs.
test('a simulated network failure leaves the wallet untouched', async () => {
  const before = await getMe();
  mockBackendConfig.failureRate = 1;

  const { status } = await call('POST', '/boxes/starter-drop/open');
  mockBackendConfig.failureRate = 0;

  expect(status).toBe(503);
  expect(await getMe()).toEqual(before);
});

// Selling closes the loop: coins come back at the watch's value, and the same watch can't be sold twice.
test('selling a watch pays its value once and removes it', async () => {
  const { body: opened } = await call<OpenBoxResult>('POST', '/boxes/starter-drop/open');

  const first = await call<SellItemResult>('POST', `/inventory/${opened.item.id}/sell`);
  const second = await call('POST', `/inventory/${opened.item.id}/sell`);
  const after = await getMe();

  expect(first.body.balance).toBe(opened.balance + opened.item.watch.value);
  expect(second.status).toBe(404);
  expect(after).toEqual({ balance: first.body.balance, inventory: [] });
});

// Unknown ids must fail loudly rather than return empty data the UI could mistake for success.
test.each([
  ['GET', '/boxes/nope'],
  ['POST', '/boxes/nope/open'],
  ['POST', '/inventory/nope/sell'],
  ['GET', '/not-a-route'],
] as const)('%s %s returns 404', async (method, path) => {
  expect((await call(method, path)).status).toBe(404);
});
