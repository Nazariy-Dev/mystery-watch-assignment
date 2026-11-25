import type { Box, Watch } from '../contract';

const WATCHES = {
  casio: { id: 'casio', name: 'Vintage Digital', brand: 'Casio', rarity: 'common', value: 60 },
  perpetual: { id: 'perpetual', name: 'Perpetual 36', brand: 'Oyster', rarity: 'rare', value: 250 },
  gmt: { id: 'gmt', name: 'GMT Master', brand: 'Oyster', rarity: 'epic', value: 700 },
  skyDweller: { id: 'sky-dweller', name: 'Sky-Dweller', brand: 'Oyster', rarity: 'legendary', value: 1800 },
} satisfies Record<string, Watch>;

// Expected payout stays below every price so selling back can't farm coins,
// while every box's top prize beats its price so each box can still win.
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
      { watch: WATCHES.casio, chance: 32 },
      { watch: WATCHES.perpetual, chance: 46 },
      { watch: WATCHES.gmt, chance: 18 },
      { watch: WATCHES.skyDweller, chance: 4 },
    ],
  },
  {
    id: 'night-vault',
    name: 'Night Vault',
    tagline: 'Where travellers hide their GMTs',
    price: 900,
    tier: 'epic',
    contents: [
      { watch: WATCHES.perpetual, chance: 35 },
      { watch: WATCHES.gmt, chance: 45 },
      { watch: WATCHES.skyDweller, chance: 20 },
    ],
  },
  {
    id: 'crown-reserve',
    name: 'Crown Reserve',
    tagline: 'No digital. Only the finest.',
    price: 1500,
    tier: 'legendary',
    contents: [
      { watch: WATCHES.perpetual, chance: 5 },
      { watch: WATCHES.gmt, chance: 45 },
      { watch: WATCHES.skyDweller, chance: 50 },
    ],
  },
];
