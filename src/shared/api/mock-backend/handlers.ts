/** Resolves one mocked endpoint; receives the original request so handlers can read body/params. */
export type MockHandler = (request: Request) => Response | Promise<Response>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Routes keyed by `METHOD /path`, relative to `API_BASE_URL`. */
export const handlers: Record<string, MockHandler> = {
  'GET /health': () => json({ ok: true }),
};
