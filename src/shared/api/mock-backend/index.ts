import { API_BASE_URL } from '@/shared/config';

import { handlers } from './handlers';

/**
 * In-app stand-in for the network: a `fetch`-compatible function that answers requests
 * to `API_BASE_URL` from local handlers. Plugged into RTK Query as `fetchBaseQuery`'s `fetchFn`,
 * so no global `fetch` is patched. Unknown routes get a 404, like a real server.
 */
export async function mockFetch(request: Request): Promise<Response> {
  const path = request.url.startsWith(API_BASE_URL) ? request.url.slice(API_BASE_URL.length) : request.url;
  const handler = handlers[`${request.method} ${path.split('?')[0]}`];

  if (!handler) {
    return new Response(JSON.stringify({ message: `No mock for ${request.method} ${path}` }), { status: 404 });
  }
  return handler(request);
}
