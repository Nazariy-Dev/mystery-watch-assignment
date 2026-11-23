import type { Box, Watch } from '../contract';

const WATCHES = {
  casio: { id: 'casio', name: 'Vintage Digital', brand: 'Casio', rarity: 'common', value: 60 },
  perpetual: { id: 'perpetual', name: 'Perpetual 36', brand: 'Oyster', rarity: 'rare', value: 250 },
  gmt: { id: 'gmt', name: 'GMT Master', brand: 'Oyster', rarity: 'epic', value: 700 },
  skyDweller: { id: 'sky-dweller', name: 'Sky-Dweller', brand: 'Oyster', rarity: 'legendary', value: 1800 },
} satisfies Record<string, Watch>;

// Expected payout stays below every price so selling back can't farm coins.
export const BOXES: Box[] = [
  {
    id: 'starter-drop',
    name: 'Starter Drop',
    tagline: 'Your first step into the vault',
    price: 150,
    tier: 'common',
    contents: [
      { watch: WATCHES.casio, chance: 80 },
      { watch: WATCHES.perpetual, chance: 16 },
      { watch: WATCHES.gmt, chance: 3 },
      { watch: WATCHES.skyDweller, chance: 1 },
    ],
  },
  {
    id: 'icy-classic',
    name: 'Icy Classic',
    tagline: 'Cool odds, timeless steel',
    price: 400,
    tier: 'rare',
    contents: [
      { watch: WATCHES.casio, chance: 45 },
      { watch: WATCHES.perpetual, chance: 40 },
      { watch: WATCHES.gmt, chance: 12 },
      { watch: WATCHES.skyDweller, chance: 3 },
    ],
  },
  {
    id: 'night-vault',
    name: 'Night Vault',
    tagline: 'Where travellers hide their GMTs',
    price: 900,
    tier: 'epic',
    contents: [
      { watch: WATCHES.casio, chance: 15 },
      { watch: WATCHES.perpetual, chance: 45 },
      { watch: WATCHES.gmt, chance: 30 },
      { watch: WATCHES.skyDweller, chance: 10 },
    ],
  },
  {
    id: 'crown-reserve',
    name: 'Crown Reserve',
    tagline: 'No digital. Only the finest.',
    price: 2000,
    tier: 'legendary',
    contents: [
      { watch: WATCHES.perpetual, chance: 20 },
      { watch: WATCHES.gmt, chance: 40 },
      { watch: WATCHES.skyDweller, chance: 40 },
    ],
  },
];
