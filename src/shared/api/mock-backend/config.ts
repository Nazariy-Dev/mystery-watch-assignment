/** Tunable at runtime; tests zero the latency and failures and inject `random`. */
export const mockBackendConfig = {
  minLatencyMs: 300,
  maxLatencyMs: 900,
  failureRate: 0.05,
  /** Balance for a fresh install and after a demo reset; generous so every box can be tried many times. */
  startingBalance: 100_000,
  random: Math.random,
};
