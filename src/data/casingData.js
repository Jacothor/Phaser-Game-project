export const WOOD_TIERS = [
  "oak",
  "birch",
  "pine",
  "willow",
  "maple",
  "yew",
  "blackwood",
  "ironwood",
  "ashenwood",
  "wildroot"
];

export const CASING_TYPES = {
  WEAPON: "weapon",
  ARMOR: "armor"
};

export const MAX_CONNECTED_GROUP_SIZE = 5;

export const WOOD_CASING_RULES = {
  oak: {
    woodTier: "oak",
    slotCount: 1
  },
  birch: {
    woodTier: "birch",
    slotCount: 2
  },
  pine: {
    woodTier: "pine",
    slotCount: 3
  },
  willow: {
    woodTier: "willow",
    slotCount: 4
  },
  maple: {
    woodTier: "maple",
    slotCount: 5
  },
  yew: {
    woodTier: "yew",
    slotCount: 6
  },
  blackwood: {
    woodTier: "blackwood",
    slotCount: 7
  },
  ironwood: {
    woodTier: "ironwood",
    slotCount: 8
  },
  ashenwood: {
    woodTier: "ashenwood",
    slotCount: 9
  },
  wildroot: {
    woodTier: "wildroot",
    slotCount: 10
  }
};

export function getCasingRule(woodTier) {
  return WOOD_CASING_RULES[woodTier] ?? null;
}