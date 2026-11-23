import { API_BASE_URL } from '@/shared/config';

import { mockBackendConfig } from './config';
import { error, handle } from './handlers';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * In-app stand-in for the network, shaped like `fetch` so RTK Query can use it as `fetchFn`.
 * Adds random latency and occasional failures; a failed request never reaches a handler,
 * so it has no side effects.
 */
export async function mockFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const request = new Request(input, init);
  const { minLatencyMs, maxLatencyMs, failureRate, random } = mockBackendConfig;

  await wait(minLatencyMs + random() * (maxLatencyMs - minLatencyMs));
  if (random() < failureRate) return error(503, 'Connection hiccup. Please try again.');

  const url = request.url.startsWith(API_BASE_URL) ? request.url.slice(API_BASE_URL.length) : request.url;
  return handle(request.method, url.split('?')[0]);
}

export { mockBackendConfig } from './config';
