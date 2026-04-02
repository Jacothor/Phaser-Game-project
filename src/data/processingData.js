// src/data/processingData.js

export const PROCESSING_SKILL_IDS = {
  SMITHING: "smithing",
  WHITTLING: "whittling"
};

export const PROCESSING_STATION_TYPES = {
  SMITHING: "smithing",
  WHITTLING: "whittling"
};

export const PROCESSING_RECIPE_DATA = {
  // =========================
  // SMITHING
  // =========================
  copper_bar: {
    id: "copper_bar",
    name: "Copper Bar",
    stationType: PROCESSING_STATION_TYPES.SMITHING,
    skillId: PROCESSING_SKILL_IDS.SMITHING,
    tier: 1,
    levelRequired: 1,
    cycleDurationMs: 3000,
    xpPerProcess: 8,
    inputs: [
      { itemId: "copper_ore", quantity: 2 }
    ],
    outputs: [
      { itemId: "copper_bar", quantity: 1 }
    ]
  },

  tin_bar: {
    id: "tin_bar",
    name: "Tin Bar",
    stationType: PROCESSING_STATION_TYPES.SMITHING,
    skillId: PROCESSING_SKILL_IDS.SMITHING,
    tier: 2,
    levelRequired: 10,
    cycleDurationMs: 3200,
    xpPerProcess: 11,
    inputs: [
      { itemId: "tin_ore", quantity: 2 }
    ],
    outputs: [
      { itemId: "tin_bar", quantity: 1 }
    ]
  },

  iron_bar: {
    id: "iron_bar",
    name: "Iron Bar",
    stationType: PROCESSING_STATION_TYPES.SMITHING,
    skillId: PROCESSING_SKILL_IDS.SMITHING,
    tier: 3,
    levelRequired: 20,
    cycleDurationMs: 3400,
    xpPerProcess: 15,
    inputs: [
      { itemId: "iron_ore", quantity: 2 },
      { itemId: "coal", quantity: 1 }
    ],
    outputs: [
      { itemId: "iron_bar", quantity: 1 }
    ]
  },

  silver_bar: {
    id: "silver_bar",
    name: "Silver Bar",
    stationType: PROCESSING_STATION_TYPES.SMITHING,
    skillId: PROCESSING_SKILL_IDS.SMITHING,
    tier: 4,
    levelRequired: 30,
    cycleDurationMs: 3600,
    xpPerProcess: 20,
    inputs: [
      { itemId: "silver_ore", quantity: 2 },
      { itemId: "coal", quantity: 1 }
    ],
    outputs: [
      { itemId: "silver_bar", quantity: 1 }
    ]
  },

  gold_bar: {
    id: "gold_bar",
    name: "Gold Bar",
    stationType: PROCESSING_STATION_TYPES.SMITHING,
    skillId: PROCESSING_SKILL_IDS.SMITHING,
    tier: 5,
    levelRequired: 40,
    cycleDurationMs: 3800,
    xpPerProcess: 26,
    inputs: [
      { itemId: "gold_ore", quantity: 2 },
      { itemId: "coal", quantity: 1 }
    ],
    outputs: [
      { itemId: "gold_bar", quantity: 1 }
    ]
  },

  stormsteel_bar: {
    id: "stormsteel_bar",
    name: "Stormsteel Bar",
    stationType: PROCESSING_STATION_TYPES.SMITHING,
    skillId: PROCESSING_SKILL_IDS.SMITHING,
    tier: 6,
    levelRequired: 50,
    cycleDurationMs: 4000,
    xpPerProcess: 33,
    inputs: [
      { itemId: "stormsteel_ore", quantity: 2 },
      { itemId: "coal", quantity: 2 }
    ],
    outputs: [
      { itemId: "stormsteel_bar", quantity: 1 }
    ]
  },

  obsidian_ingot: {
    id: "obsidian_ingot",
    name: "Obsidian Ingot",
    stationType: PROCESSING_STATION_TYPES.SMITHING,
    skillId: PROCESSING_SKILL_IDS.SMITHING,
    tier: 7,
    levelRequired: 60,
    cycleDurationMs: 4300,
    xpPerProcess: 41,
    inputs: [
      { itemId: "obsidian_shard", quantity: 3 },
      { itemId: "coal", quantity: 2 }
    ],
    outputs: [
      { itemId: "obsidian_ingot", quantity: 1 }
    ]
  },

  luminite_bar: {
    id: "luminite_bar",
    name: "Luminite Bar",
    stationType: PROCESSING_STATION_TYPES.SMITHING,
    skillId: PROCESSING_SKILL_IDS.SMITHING,
    tier: 8,
    levelRequired: 70,
    cycleDurationMs: 4600,
    xpPerProcess: 50,
    inputs: [
      { itemId: "luminite_ore", quantity: 2 },
      { itemId: "coal", quantity: 2 }
    ],
    outputs: [
      { itemId: "luminite_bar", quantity: 1 }
    ]
  },

  voidstone_ingot: {
    id: "voidstone_ingot",
    name: "Voidstone Ingot",
    stationType: PROCESSING_STATION_TYPES.SMITHING,
    skillId: PROCESSING_SKILL_IDS.SMITHING,
    tier: 9,
    levelRequired: 80,
    cycleDurationMs: 4900,
    xpPerProcess: 60,
    inputs: [
      { itemId: "voidstone_chunk", quantity: 2 },
      { itemId: "coal", quantity: 3 }
    ],
    outputs: [
      { itemId: "voidstone_ingot", quantity: 1 }
    ]
  },

  reforged_voidstone_ingot: {
    id: "reforged_voidstone_ingot",
    name: "Reforged Voidstone Ingot",
    stationType: PROCESSING_STATION_TYPES.SMITHING,
    skillId: PROCESSING_SKILL_IDS.SMITHING,
    tier: 10,
    levelRequired: 90,
    cycleDurationMs: 5200,
    xpPerProcess: 72,
    inputs: [
      { itemId: "voidstone_chunk", quantity: 3 },
      { itemId: "luminite_ore", quantity: 1 },
      { itemId: "coal", quantity: 3 }
    ],
    outputs: [
      { itemId: "reforged_voidstone_ingot", quantity: 1 }
    ]
  },

  // =========================
  // WHITTLING
  // =========================
  oak_shaft: {
    id: "oak_shaft",
    name: "Oak Shaft",
    stationType: PROCESSING_STATION_TYPES.WHITTLING,
    skillId: PROCESSING_SKILL_IDS.WHITTLING,
    tier: 1,
    levelRequired: 1,
    cycleDurationMs: 2400,
    xpPerProcess: 7,
    inputs: [
      { itemId: "oak_log", quantity: 1 }
    ],
    outputs: [
      { itemId: "oak_shaft", quantity: 2 }
    ]
  },

  birch_handle: {
    id: "birch_handle",
    name: "Birch Handle",
    stationType: PROCESSING_STATION_TYPES.WHITTLING,
    skillId: PROCESSING_SKILL_IDS.WHITTLING,
    tier: 2,
    levelRequired: 10,
    cycleDurationMs: 2550,
    xpPerProcess: 10,
    inputs: [
      { itemId: "birch_log", quantity: 1 }
    ],
    outputs: [
      { itemId: "birch_handle", quantity: 1 }
    ]
  },

  pine_shaft: {
    id: "pine_shaft",
    name: "Pine Shaft",
    stationType: PROCESSING_STATION_TYPES.WHITTLING,
    skillId: PROCESSING_SKILL_IDS.WHITTLING,
    tier: 3,
    levelRequired: 20,
    cycleDurationMs: 2700,
    xpPerProcess: 14,
    inputs: [
      { itemId: "pine_log", quantity: 1 }
    ],
    outputs: [
      { itemId: "pine_shaft", quantity: 2 }
    ]
  },

  willow_focus: {
    id: "willow_focus",
    name: "Willow Focus",
    stationType: PROCESSING_STATION_TYPES.WHITTLING,
    skillId: PROCESSING_SKILL_IDS.WHITTLING,
    tier: 4,
    levelRequired: 30,
    cycleDurationMs: 2850,
    xpPerProcess: 19,
    inputs: [
      { itemId: "willow_log", quantity: 1 }
    ],
    outputs: [
      { itemId: "willow_focus", quantity: 1 }
    ]
  },

  maple_grip: {
    id: "maple_grip",
    name: "Maple Grip",
    stationType: PROCESSING_STATION_TYPES.WHITTLING,
    skillId: PROCESSING_SKILL_IDS.WHITTLING,
    tier: 5,
    levelRequired: 40,
    cycleDurationMs: 3000,
    xpPerProcess: 25,
    inputs: [
      { itemId: "maple_log", quantity: 1 }
    ],
    outputs: [
      { itemId: "maple_grip", quantity: 1 }
    ]
  },

  yew_core: {
    id: "yew_core",
    name: "Yew Core",
    stationType: PROCESSING_STATION_TYPES.WHITTLING,
    skillId: PROCESSING_SKILL_IDS.WHITTLING,
    tier: 6,
    levelRequired: 50,
    cycleDurationMs: 3200,
    xpPerProcess: 32,
    inputs: [
      { itemId: "yew_log", quantity: 1 }
    ],
    outputs: [
      { itemId: "yew_core", quantity: 1 }
    ]
  },

  blackwood_stock: {
    id: "blackwood_stock",
    name: "Blackwood Stock",
    stationType: PROCESSING_STATION_TYPES.WHITTLING,
    skillId: PROCESSING_SKILL_IDS.WHITTLING,
    tier: 7,
    levelRequired: 60,
    cycleDurationMs: 3400,
    xpPerProcess: 40,
    inputs: [
      { itemId: "blackwood_log", quantity: 1 }
    ],
    outputs: [
      { itemId: "blackwood_stock", quantity: 1 }
    ]
  },

  ironwood_frame: {
    id: "ironwood_frame",
    name: "Ironwood Frame",
    stationType: PROCESSING_STATION_TYPES.WHITTLING,
    skillId: PROCESSING_SKILL_IDS.WHITTLING,
    tier: 8,
    levelRequired: 70,
    cycleDurationMs: 3600,
    xpPerProcess: 49,
    inputs: [
      { itemId: "ironwood_log", quantity: 1 }
    ],
    outputs: [
      { itemId: "ironwood_frame", quantity: 1 }
    ]
  },

  ashenwood_totem: {
    id: "ashenwood_totem",
    name: "Ashenwood Totem",
    stationType: PROCESSING_STATION_TYPES.WHITTLING,
    skillId: PROCESSING_SKILL_IDS.WHITTLING,
    tier: 9,
    levelRequired: 80,
    cycleDurationMs: 3850,
    xpPerProcess: 59,
    inputs: [
      { itemId: "ashenwood_log", quantity: 1 }
    ],
    outputs: [
      { itemId: "ashenwood_totem", quantity: 1 }
    ]
  },

  worldroot_idol: {
    id: "worldroot_idol",
    name: "Worldroot Idol",
    stationType: PROCESSING_STATION_TYPES.WHITTLING,
    skillId: PROCESSING_SKILL_IDS.WHITTLING,
    tier: 10,
    levelRequired: 90,
    cycleDurationMs: 4100,
    xpPerProcess: 70,
    inputs: [
      { itemId: "worldroot_log", quantity: 1 }
    ],
    outputs: [
      { itemId: "worldroot_idol", quantity: 1 }
    ]
  }
};

export const PROCESSING_STATION_DATA = {
  smithing_anvil: {
    id: "smithing_anvil",
    name: "Smithing Anvil",
    stationType: PROCESSING_STATION_TYPES.SMITHING,
    recipeIds: [
      "copper_bar",
      "tin_bar",
      "iron_bar",
      "silver_bar",
      "gold_bar",
      "stormsteel_bar",
      "obsidian_ingot",
      "luminite_bar",
      "voidstone_ingot",
      "reforged_voidstone_ingot"
    ]
  },

  whittling_bench: {
    id: "whittling_bench",
    name: "Whittling Bench",
    stationType: PROCESSING_STATION_TYPES.WHITTLING,
    recipeIds: [
      "oak_shaft",
      "birch_handle",
      "pine_shaft",
      "willow_focus",
      "maple_grip",
      "yew_core",
      "blackwood_stock",
      "ironwood_frame",
      "ashenwood_totem",
      "worldroot_idol"
    ]
  }
};

export function getProcessingRecipe(recipeId) {
  return PROCESSING_RECIPE_DATA[recipeId] ?? null;
}

export function getProcessingStation(stationId) {
  return PROCESSING_STATION_DATA[stationId] ?? null;
}

export function getRecipesForStation(stationId) {
  const station = getProcessingStation(stationId);
  if (!station) {
    return [];
  }

  return station.recipeIds
    .map((recipeId) => getProcessingRecipe(recipeId))
    .filter(Boolean);
}

export function getRecipesForStationType(stationType) {
  return Object.values(PROCESSING_RECIPE_DATA).filter(
    (recipe) => recipe.stationType === stationType
  );
}