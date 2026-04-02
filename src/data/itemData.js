// src/data/itemData.js

export const ITEM_DATA = {
  // =========================
  // EXISTING
  // =========================
  wolf_pelt: {
    id: "wolf_pelt",
    name: "Wolf Pelt",
    iconSheet: "ITEMS",
    frame: 219,
    type: "material",
    stackable: false,
    maxStack: 1,
    value: 5,
  },

  blue_berries: {
    id: "blue_berries",
    name: "Blue Berries",
    iconSheet: "ITEMS",
    frame: 460,
    type: "food",
    stackable: true,
    maxStack: 10,
    value: 20,
  },

  old_key: {
    id: "old_key",
    name: "Old Key",
    iconSheet: "ITEMS",
    frame: 54,
    type: "key",
    stackable: false,
    maxStack: 1,
    value: 0,
  },
  iron_sword: {
    id: "iron_sword",
    name: "Iron Sword",
    type: "equipment",
    slot: "weapon",
    bonuses: [
      {
        type: "stat",
        stat: "attack",
        mode: "add",
        value: 3,
      },
    ],
  },

  // =========================
  // GATHERED MATERIALS - ORES
  // =========================
  copper_ore: {
    id: "copper_ore",
    name: "Copper Ore",
    iconSheet: "ITEMS",
    frame: 195,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 4,
  },

  tin_ore: {
    id: "tin_ore",
    name: "Tin Ore",
    iconSheet: "ITEMS",
    frame: 1,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 5,
  },

  iron_ore: {
    id: "iron_ore",
    name: "Iron Ore",
    iconSheet: "ITEMS",
    frame: 211,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 7,
  },

  coal: {
    id: "coal",
    name: "Coal",
    iconSheet: "ITEMS",
    frame: 3,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 6,
  },

  silver_ore: {
    id: "silver_ore",
    name: "Silver Ore",
    iconSheet: "ITEMS",
    frame: 4,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 10,
  },

  gold_ore: {
    id: "gold_ore",
    name: "Gold Ore",
    iconSheet: "ITEMS",
    frame: 5,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 14,
  },

  stormsteel_ore: {
    id: "stormsteel_ore",
    name: "Stormsteel Ore",
    iconSheet: "ITEMS",
    frame: 6,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 20,
  },

  obsidian_shard: {
    id: "obsidian_shard",
    name: "Obsidian Shard",
    iconSheet: "ITEMS",
    frame: 7,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 24,
  },

  luminite_ore: {
    id: "luminite_ore",
    name: "Luminite Ore",
    iconSheet: "ITEMS",
    frame: 8,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 30,
  },

  voidstone_chunk: {
    id: "voidstone_chunk",
    name: "Voidstone Chunk",
    iconSheet: "ITEMS",
    frame: 9,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 40,
  },

  // =========================
  // GATHERED MATERIALS - LOGS
  // =========================
  oak_log: {
    id: "oak_log",
    name: "Oak Log",
    iconSheet: "ITEMS",
    frame: 108,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 4,
  },

  birch_log: {
    id: "birch_log",
    name: "Birch Log",
    iconSheet: "ITEMS",
    frame: 21,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 5,
  },

  pine_log: {
    id: "pine_log",
    name: "Pine Log",
    iconSheet: "ITEMS",
    frame: 22,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 7,
  },

  willow_log: {
    id: "willow_log",
    name: "Willow Log",
    iconSheet: "ITEMS",
    frame: 23,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 9,
  },

  maple_log: {
    id: "maple_log",
    name: "Maple Log",
    iconSheet: "ITEMS",
    frame: 24,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 12,
  },

  yew_log: {
    id: "yew_log",
    name: "Yew Log",
    iconSheet: "ITEMS",
    frame: 25,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 16,
  },

  blackwood_log: {
    id: "blackwood_log",
    name: "Blackwood Log",
    iconSheet: "ITEMS",
    frame: 26,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 21,
  },

  ironwood_log: {
    id: "ironwood_log",
    name: "Ironwood Log",
    iconSheet: "ITEMS",
    frame: 27,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 27,
  },

  ashenwood_log: {
    id: "ashenwood_log",
    name: "Ashenwood Log",
    iconSheet: "ITEMS",
    frame: 28,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 34,
  },

  worldroot_log: {
    id: "worldroot_log",
    name: "Worldroot Log",
    iconSheet: "ITEMS",
    frame: 29,
    type: "material",
    stackable: true,
    maxStack: 50,
    value: 42,
  },

  // =========================
  // SMITHING OUTPUTS
  // =========================
  copper_bar: {
    id: "copper_bar",
    name: "Copper Bar",
    iconSheet: "ITEMS",
    frame: 40,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 12,
  },

  tin_bar: {
    id: "tin_bar",
    name: "Tin Bar",
    iconSheet: "ITEMS",
    frame: 41,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 14,
  },

  iron_bar: {
    id: "iron_bar",
    name: "Iron Bar",
    iconSheet: "ITEMS",
    frame: 42,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 20,
  },

  silver_bar: {
    id: "silver_bar",
    name: "Silver Bar",
    iconSheet: "ITEMS",
    frame: 43,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 28,
  },

  gold_bar: {
    id: "gold_bar",
    name: "Gold Bar",
    iconSheet: "ITEMS",
    frame: 44,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 38,
  },

  stormsteel_bar: {
    id: "stormsteel_bar",
    name: "Stormsteel Bar",
    iconSheet: "ITEMS",
    frame: 45,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 52,
  },

  obsidian_ingot: {
    id: "obsidian_ingot",
    name: "Obsidian Ingot",
    iconSheet: "ITEMS",
    frame: 46,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 68,
  },

  luminite_bar: {
    id: "luminite_bar",
    name: "Luminite Bar",
    iconSheet: "ITEMS",
    frame: 47,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 86,
  },

  voidstone_ingot: {
    id: "voidstone_ingot",
    name: "Voidstone Ingot",
    iconSheet: "ITEMS",
    frame: 48,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 108,
  },

  reforged_voidstone_ingot: {
    id: "reforged_voidstone_ingot",
    name: "Reforged Voidstone Ingot",
    iconSheet: "ITEMS",
    frame: 49,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 140,
  },

  // =========================
  // WHITTLING OUTPUTS
  // =========================
  oak_shaft: {
    id: "oak_shaft",
    name: "Oak Shaft",
    iconSheet: "ITEMS",
    frame: 60,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 10,
  },

  birch_handle: {
    id: "birch_handle",
    name: "Birch Handle",
    iconSheet: "ITEMS",
    frame: 61,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 12,
  },

  pine_shaft: {
    id: "pine_shaft",
    name: "Pine Shaft",
    iconSheet: "ITEMS",
    frame: 62,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 15,
  },

  willow_focus: {
    id: "willow_focus",
    name: "Willow Focus",
    iconSheet: "ITEMS",
    frame: 63,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 20,
  },

  maple_grip: {
    id: "maple_grip",
    name: "Maple Grip",
    iconSheet: "ITEMS",
    frame: 64,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 26,
  },

  yew_core: {
    id: "yew_core",
    name: "Yew Core",
    iconSheet: "ITEMS",
    frame: 65,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 33,
  },

  blackwood_stock: {
    id: "blackwood_stock",
    name: "Blackwood Stock",
    iconSheet: "ITEMS",
    frame: 66,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 41,
  },

  ironwood_frame: {
    id: "ironwood_frame",
    name: "Ironwood Frame",
    iconSheet: "ITEMS",
    frame: 67,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 50,
  },

  ashenwood_totem: {
    id: "ashenwood_totem",
    name: "Ashenwood Totem",
    iconSheet: "ITEMS",
    frame: 68,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 60,
  },

  worldroot_idol: {
    id: "worldroot_idol",
    name: "Worldroot Idol",
    iconSheet: "ITEMS",
    frame: 69,
    type: "processed_material",
    stackable: true,
    maxStack: 50,
    value: 72,
  },
};
