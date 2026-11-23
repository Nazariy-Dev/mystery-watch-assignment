/**
 * Picks one entry with probability proportional to its weight.
 * `random` returns [0, 1); injected so odds can be tested deterministically.
 */
export function rollWeighted<T>(entries: { item: T; weight: number }[], random: () => number): T {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let threshold = random() * total;

  for (const entry of entries) {
    threshold -= entry.weight;
    if (threshold < 0) return entry.item;
  }
  // Floating-point drift can leave a hair above zero; the last entry owns that sliver.
  return entries[entries.length - 1].item;
}
