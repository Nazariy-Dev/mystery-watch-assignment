import type { ApiErrorBody, Me, OpenBoxResult, OwnedItem, SellItemResult } from '../contract';

import { BOXES } from './catalogue';
import { mockBackendConfig } from './config';
import { readState, resetState, writeState } from './db';
import { rollWeighted } from './roll';

type Params = Record<string, string>;

type Route = {
  method: 'GET' | 'POST';
  /** Path with `:name` segments captured into params, e.g. `/boxes/:boxId`. */
  path: string;
  handle: (params: Params) => Response;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const error = (status: number, message: string) => json({ message } satisfies ApiErrorBody, status);

const routes: Route[] = [
  { method: 'GET', path: '/boxes', handle: () => json(BOXES) },
  {
    method: 'GET',
    path: '/boxes/:boxId',
    handle: ({ boxId }) => {
      const box = BOXES.find((candidate) => candidate.id === boxId);
      return box ? json(box) : error(404, 'Box not found');
    },
  },
  { method: 'GET', path: '/me', handle: () => json(readState() satisfies Me) },
  {
    method: 'POST',
    path: '/boxes/:boxId/open',
    handle: ({ boxId }) => {
      const box = BOXES.find((candidate) => candidate.id === boxId);
      if (!box) return error(404, 'Box not found');

      const state = readState();
      if (state.balance < box.price) return error(402, 'Not enough coins');

      const watch = rollWeighted(
        box.contents.map((content) => ({ item: content.watch, weight: content.chance })),
        mockBackendConfig.random,
      );
      const item: OwnedItem = {
        id: `${Date.now().toString(36)}-${mockBackendConfig.random().toString(36).slice(2, 8)}`,
        watch,
        boxId,
        wonAt: Date.now(),
      };
      // Charge and grant in one write so a box is never paid for without its watch.
      const balance = state.balance - box.price;
      writeState({ balance, inventory: [item, ...state.inventory] });
      return json({ item, balance } satisfies OpenBoxResult);
    },
  },
  {
    method: 'POST',
    path: '/inventory/:itemId/sell',
    handle: ({ itemId }) => {
      const state = readState();
      const item = state.inventory.find((candidate) => candidate.id === itemId);
      if (!item) return error(404, 'Item not found');

      const balance = state.balance + item.watch.value;
      writeState({ balance, inventory: state.inventory.filter((candidate) => candidate.id !== itemId) });
      return json({ balance } satisfies SellItemResult);
    },
  },
  { method: 'POST', path: '/reset', handle: () => json(resetState() satisfies Me) },
];

function matchPath(pattern: string, path: string): Params | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  if (patternParts.length !== pathParts.length) return null;

  const params: Params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    else if (patternParts[i] !== pathParts[i]) return null;
  }
  return params;
}

/** Answers a request for `path` (relative to the API origin); unknown routes get a 404. */
export function handle(method: string, path: string): Response {
  for (const route of routes) {
    if (route.method !== method) continue;
    const params = matchPath(route.path, path);
    if (params) return route.handle(params);
  }
  return error(404, `No mock for ${method} ${path}`);
}

export { error };
