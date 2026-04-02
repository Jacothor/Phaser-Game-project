export const EQUIPMENT_SLOTS = {
  SWORD: "sword",
  ARMOR: "armor",
  ACCESSORY1: "accessory1",
  ACCESSORY2: "accessory2"
};

export const EQUIPMENT_CATEGORIES = {
  WEAPON: "weapon",
  ARMOR: "armor",
  ACCESSORY: "accessory"
};

export const METAL_TIERS = [
  "copper",
  "iron",
  "deep_silver",
  "stormsteel",
  "obsidian",
  "luminite",
  "voidstone"
];

export const EQUIPMENT_BASE_DATA = {
  copper_sword: {
    id: "copper_sword",
    name: "Copper Sword",
    slot: EQUIPMENT_SLOTS.SWORD,
    category: EQUIPMENT_CATEGORIES.WEAPON,
    metalTier: "copper",
    baseStats: {
      attack: 2
    },
    canAssembleCasing: true,
    casingType: "weapon"
  },

  iron_sword: {
    id: "iron_sword",
    name: "Iron Sword",
    slot: EQUIPMENT_SLOTS.SWORD,
    category: EQUIPMENT_CATEGORIES.WEAPON,
    metalTier: "iron",
    baseStats: {
      attack: 4
    },
    canAssembleCasing: true,
    casingType: "weapon"
  },

  deep_silver_sword: {
    id: "deep_silver_sword",
    name: "Deep Silver Sword",
    slot: EQUIPMENT_SLOTS.SWORD,
    category: EQUIPMENT_CATEGORIES.WEAPON,
    metalTier: "deep_silver",
    baseStats: {
      attack: 6
    },
    canAssembleCasing: true,
    casingType: "weapon"
  },

  stormsteel_sword: {
    id: "stormsteel_sword",
    name: "Stormsteel Sword",
    slot: EQUIPMENT_SLOTS.SWORD,
    category: EQUIPMENT_CATEGORIES.WEAPON,
    metalTier: "stormsteel",
    baseStats: {
      attack: 8
    },
    canAssembleCasing: true,
    casingType: "weapon"
  },

  obsidian_sword: {
    id: "obsidian_sword",
    name: "Obsidian Sword",
    slot: EQUIPMENT_SLOTS.SWORD,
    category: EQUIPMENT_CATEGORIES.WEAPON,
    metalTier: "obsidian",
    baseStats: {
      attack: 10
    },
    canAssembleCasing: true,
    casingType: "weapon"
  },

  luminite_sword: {
    id: "luminite_sword",
    name: "Luminite Sword",
    slot: EQUIPMENT_SLOTS.SWORD,
    category: EQUIPMENT_CATEGORIES.WEAPON,
    metalTier: "luminite",
    baseStats: {
      attack: 12
    },
    canAssembleCasing: true,
    casingType: "weapon"
  },

  voidstone_sword: {
    id: "voidstone_sword",
    name: "Voidstone Sword",
    slot: EQUIPMENT_SLOTS.SWORD,
    category: EQUIPMENT_CATEGORIES.WEAPON,
    metalTier: "voidstone",
    baseStats: {
      attack: 15
    },
    canAssembleCasing: true,
    casingType: "weapon"
  },

  copper_armor: {
    id: "copper_armor",
    name: "Copper Armor",
    slot: EQUIPMENT_SLOTS.ARMOR,
    category: EQUIPMENT_CATEGORIES.ARMOR,
    metalTier: "copper",
    baseStats: {
      defense: 2,
      maxHealth: 2
    },
    canAssembleCasing: true,
    casingType: "armor"
  },

  iron_armor: {
    id: "iron_armor",
    name: "Iron Armor",
    slot: EQUIPMENT_SLOTS.ARMOR,
    category: EQUIPMENT_CATEGORIES.ARMOR,
    metalTier: "iron",
    baseStats: {
      defense: 4,
      maxHealth: 4
    },
    canAssembleCasing: true,
    casingType: "armor"
  },

  deep_silver_armor: {
    id: "deep_silver_armor",
    name: "Deep Silver Armor",
    slot: EQUIPMENT_SLOTS.ARMOR,
    category: EQUIPMENT_CATEGORIES.ARMOR,
    metalTier: "deep_silver",
    baseStats: {
      defense: 6,
      maxHealth: 6
    },
    canAssembleCasing: true,
    casingType: "armor"
  },

  stormsteel_armor: {
    id: "stormsteel_armor",
    name: "Stormsteel Armor",
    slot: EQUIPMENT_SLOTS.ARMOR,
    category: EQUIPMENT_CATEGORIES.ARMOR,
    metalTier: "stormsteel",
    baseStats: {
      defense: 8,
      maxHealth: 8
    },
    canAssembleCasing: true,
    casingType: "armor"
  },

  obsidian_armor: {
    id: "obsidian_armor",
    name: "Obsidian Armor",
    slot: EQUIPMENT_SLOTS.ARMOR,
    category: EQUIPMENT_CATEGORIES.ARMOR,
    metalTier: "obsidian",
    baseStats: {
      defense: 10,
      maxHealth: 10
    },
    canAssembleCasing: true,
    casingType: "armor"
  },

  luminite_armor: {
    id: "luminite_armor",
    name: "Luminite Armor",
    slot: EQUIPMENT_SLOTS.ARMOR,
    category: EQUIPMENT_CATEGORIES.ARMOR,
    metalTier: "luminite",
    baseStats: {
      defense: 12,
      maxHealth: 12
    },
    canAssembleCasing: true,
    casingType: "armor"
  },

  voidstone_armor: {
    id: "voidstone_armor",
    name: "Voidstone Armor",
    slot: EQUIPMENT_SLOTS.ARMOR,
    category: EQUIPMENT_CATEGORIES.ARMOR,
    metalTier: "voidstone",
    baseStats: {
      defense: 15,
      maxHealth: 15
    },
    canAssembleCasing: true,
    casingType: "armor"
  }
};

export function getEquipmentBaseDef(defId) {
  return EQUIPMENT_BASE_DATA[defId] ?? null;
}