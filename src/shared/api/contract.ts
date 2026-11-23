export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type Watch = {
  id: string;
  name: string;
  brand: string;
  rarity: Rarity;
  /** Coins paid out when the watch is sold back. */
  value: number;
};

export type BoxContent = {
  watch: Watch;
  /** Percentage chance; a box's contents sum to 100. */
  chance: number;
};

export type Box = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  tier: Rarity;
  contents: BoxContent[];
};

export type OwnedItem = {
  id: string;
  watch: Watch;
  boxId: string;
  wonAt: number;
};

export type Me = {
  balance: number;
  inventory: OwnedItem[];
};

export type OpenBoxResult = {
  item: OwnedItem;
  balance: number;
};

export type SellItemResult = {
  balance: number;
};

export type ApiErrorBody = {
  message: string;
};
