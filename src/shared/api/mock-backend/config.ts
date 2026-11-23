/** Tunable at runtime; tests zero the latency and failures and inject `random`. */
export const mockBackendConfig = {
  minLatencyMs: 300,
  maxLatencyMs: 900,
  failureRate: 0.05,
  random: Math.random,
};
