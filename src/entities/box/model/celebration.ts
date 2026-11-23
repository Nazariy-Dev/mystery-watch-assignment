import type { Rarity } from '@/shared/api';

export type Celebration = {
  /** Sparks in each wave of the fountain. */
  sparks: number[];
  /** Brightness and reach of the light shafts; 1 is the full effect. */
  rays: number;
  /** Seconds of slow motion right after the lid blows; 0 for none. */
  slowMo: number;
  /** Extra seconds the open box is shown before the result card. */
  linger: number;
};

/** How hard each rarity celebrates: a common must not look like a legendary, or the legendary means nothing. */
export const CELEBRATION: Record<Rarity, Celebration> = {
  common: { sparks: [50], rays: 0.5, slowMo: 0, linger: 0 },
  rare: { sparks: [90], rays: 0.8, slowMo: 0, linger: 0.2 },
  epic: { sparks: [140], rays: 1, slowMo: 0.5, linger: 0.5 },
  legendary: { sparks: [140, 80], rays: 1.3, slowMo: 0.8, linger: 0.9 },
};
