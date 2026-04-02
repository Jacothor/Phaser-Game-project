// src/data/gatheringData.js

export const GATHERING_TIER_LEVELS = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90];

export const GATHERING_SKILL_IDS = {
  MINING: "mining",
  WOODCUTTING: "woodcutting",
  FISHING: "fishing"
};

export const GATHERING_NODE_DATA = {
  // =========================
  // MINING
  // =========================
  copper_vein: {
    id: "copper_vein",
    name: "Copper Vein",
    skillId: GATHERING_SKILL_IDS.MINING,
    tier: 1,
    levelRequired: 1,
    outputItemId: "copper_ore",
    xpPerGather: 5,
    cycleDurationMs: 3000,
    respawnTimeMs: 120000,
    capacityMin: 5,
    capacityMax: 8
  },

  tin_vein: {
    id: "tin_vein",
    name: "Tin Vein",
    skillId: GATHERING_SKILL_IDS.MINING,
    tier: 2,
    levelRequired: 10,
    outputItemId: "tin_ore",
    xpPerGather: 7,
    cycleDurationMs: 3200,
    respawnTimeMs: 120000,
    capacityMin: 5,
    capacityMax: 7
  },

  iron_vein: {
    id: "iron_vein",
    name: "Iron Vein",
    skillId: GATHERING_SKILL_IDS.MINING,
    tier: 3,
    levelRequired: 20,
    outputItemId: "iron_ore",
    xpPerGather: 10,
    cycleDurationMs: 3400,
    respawnTimeMs: 120000,
    capacityMin: 4,
    capacityMax: 7
  },

  coal_seam: {
    id: "coal_seam",
    name: "Coal Seam",
    skillId: GATHERING_SKILL_IDS.MINING,
    tier: 4,
    levelRequired: 30,
    outputItemId: "coal",
    xpPerGather: 14,
    cycleDurationMs: 3600,
    respawnTimeMs: 120000,
    capacityMin: 4,
    capacityMax: 6
  },

  silver_vein: {
    id: "silver_vein",
    name: "Silver Vein",
    skillId: GATHERING_SKILL_IDS.MINING,
    tier: 5,
    levelRequired: 40,
    outputItemId: "silver_ore",
    xpPerGather: 19,
    cycleDurationMs: 3800,
    respawnTimeMs: 120000,
    capacityMin: 4,
    capacityMax: 6
  },

  gold_vein: {
    id: "gold_vein",
    name: "Gold Vein",
    skillId: GATHERING_SKILL_IDS.MINING,
    tier: 6,
    levelRequired: 50,
    outputItemId: "gold_ore",
    xpPerGather: 25,
    cycleDurationMs: 4000,
    respawnTimeMs: 120000,
    capacityMin: 3,
    capacityMax: 5
  },

  stormsteel_vein: {
    id: "stormsteel_vein",
    name: "Stormsteel Vein",
    skillId: GATHERING_SKILL_IDS.MINING,
    tier: 7,
    levelRequired: 60,
    outputItemId: "stormsteel_ore",
    xpPerGather: 32,
    cycleDurationMs: 4200,
    respawnTimeMs: 120000,
    capacityMin: 3,
    capacityMax: 5
  },

  obsidian_vein: {
    id: "obsidian_vein",
    name: "Obsidian Vein",
    skillId: GATHERING_SKILL_IDS.MINING,
    tier: 8,
    levelRequired: 70,
    outputItemId: "obsidian_shard",
    xpPerGather: 40,
    cycleDurationMs: 4400,
    respawnTimeMs: 120000,
    capacityMin: 3,
    capacityMax: 4
  },

  luminite_vein: {
    id: "luminite_vein",
    name: "Luminite Vein",
    skillId: GATHERING_SKILL_IDS.MINING,
    tier: 9,
    levelRequired: 80,
    outputItemId: "luminite_ore",
    xpPerGather: 49,
    cycleDurationMs: 4600,
    respawnTimeMs: 120000,
    capacityMin: 2,
    capacityMax: 4
  },

  voidstone_vein: {
    id: "voidstone_vein",
    name: "Voidstone Vein",
    skillId: GATHERING_SKILL_IDS.MINING,
    tier: 10,
    levelRequired: 90,
    outputItemId: "voidstone_chunk",
    xpPerGather: 60,
    cycleDurationMs: 4800,
    respawnTimeMs: 120000,
    capacityMin: 2,
    capacityMax: 3
  },

  // =========================
  // WOODCUTTING
  // =========================
  oak_tree: {
    id: "oak_tree",
    name: "Oak Tree",
    skillId: GATHERING_SKILL_IDS.WOODCUTTING,
    tier: 1,
    levelRequired: 1,
    outputItemId: "oak_log",
    xpPerGather: 5,
    cycleDurationMs: 2800,
    respawnTimeMs: 90000,
    capacityMin: 6,
    capacityMax: 10
  },

  birch_tree: {
    id: "birch_tree",
    name: "Birch Tree",
    skillId: GATHERING_SKILL_IDS.WOODCUTTING,
    tier: 2,
    levelRequired: 10,
    outputItemId: "birch_log",
    xpPerGather: 8,
    cycleDurationMs: 2900,
    respawnTimeMs: 90000,
    capacityMin: 6,
    capacityMax: 9
  },

  pine_tree: {
    id: "pine_tree",
    name: "Pine Tree",
    skillId: GATHERING_SKILL_IDS.WOODCUTTING,
    tier: 3,
    levelRequired: 20,
    outputItemId: "pine_log",
    xpPerGather: 12,
    cycleDurationMs: 3000,
    respawnTimeMs: 90000,
    capacityMin: 5,
    capacityMax: 9
  },

  willow_tree: {
    id: "willow_tree",
    name: "Willow Tree",
    skillId: GATHERING_SKILL_IDS.WOODCUTTING,
    tier: 4,
    levelRequired: 30,
    outputItemId: "willow_log",
    xpPerGather: 17,
    cycleDurationMs: 3100,
    respawnTimeMs: 90000,
    capacityMin: 5,
    capacityMax: 8
  },

  maple_tree: {
    id: "maple_tree",
    name: "Maple Tree",
    skillId: GATHERING_SKILL_IDS.WOODCUTTING,
    tier: 5,
    levelRequired: 40,
    outputItemId: "maple_log",
    xpPerGather: 23,
    cycleDurationMs: 3200,
    respawnTimeMs: 90000,
    capacityMin: 5,
    capacityMax: 7
  },

  yew_tree: {
    id: "yew_tree",
    name: "Yew Tree",
    skillId: GATHERING_SKILL_IDS.WOODCUTTING,
    tier: 6,
    levelRequired: 50,
    outputItemId: "yew_log",
    xpPerGather: 30,
    cycleDurationMs: 3300,
    respawnTimeMs: 90000,
    capacityMin: 4,
    capacityMax: 7
  },

  blackwood_tree: {
    id: "blackwood_tree",
    name: "Blackwood Tree",
    skillId: GATHERING_SKILL_IDS.WOODCUTTING,
    tier: 7,
    levelRequired: 60,
    outputItemId: "blackwood_log",
    xpPerGather: 38,
    cycleDurationMs: 3400,
    respawnTimeMs: 90000,
    capacityMin: 4,
    capacityMax: 6
  },

  ironwood_tree: {
    id: "ironwood_tree",
    name: "Ironwood Tree",
    skillId: GATHERING_SKILL_IDS.WOODCUTTING,
    tier: 8,
    levelRequired: 70,
    outputItemId: "ironwood_log",
    xpPerGather: 47,
    cycleDurationMs: 3500,
    respawnTimeMs: 90000,
    capacityMin: 3,
    capacityMax: 6
  },

  ashenwood_tree: {
    id: "ashenwood_tree",
    name: "Ashenwood Tree",
    skillId: GATHERING_SKILL_IDS.WOODCUTTING,
    tier: 9,
    levelRequired: 80,
    outputItemId: "ashenwood_log",
    xpPerGather: 57,
    cycleDurationMs: 3600,
    respawnTimeMs: 90000,
    capacityMin: 3,
    capacityMax: 5
  },

  worldroot_tree: {
    id: "worldroot_tree",
    name: "Worldroot Tree",
    skillId: GATHERING_SKILL_IDS.WOODCUTTING,
    tier: 10,
    levelRequired: 90,
    outputItemId: "worldroot_log",
    xpPerGather: 68,
    cycleDurationMs: 3700,
    respawnTimeMs: 90000,
    capacityMin: 2,
    capacityMax: 4
  }
};

export function getGatheringNodeDef(nodeDefId) {
  return GATHERING_NODE_DATA[nodeDefId] ?? null;
}

export function getGatheringNodesBySkill(skillId) {
  return Object.values(GATHERING_NODE_DATA).filter(
    (nodeDef) => nodeDef.skillId === skillId
  );
}

export function getRandomNodeCapacity(nodeDef) {
  if (!nodeDef) {
    return 0;
  }

  const min = Math.max(1, nodeDef.capacityMin ?? 1);
  const max = Math.max(min, nodeDef.capacityMax ?? min);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}