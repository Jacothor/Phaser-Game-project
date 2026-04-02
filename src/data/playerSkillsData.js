export const MAX_SKILL_LEVEL = 100;

export const SKILL_DEFS = {
  woodcutting: { label: "Woodcutting", startLevel: 1, startExp: 0 },
  mining: { label: "Mining", startLevel: 1, startExp: 0 },
  fishing: { label: "Fishing", startLevel: 1, startExp: 0 },
  smithing: { label: "Smithing", startLevel: 1, startExp: 0 },
  whittling: { label: "Whittling", startLevel: 1, startExp: 0 },
  syphoning: { label: "Syphoning", startLevel: 70, startExp: 0 },

  vigor: { label: "Vigor", startLevel: 1, startExp: 0 },
  endurance: { label: "Endurance", startLevel: 1, startExp: 0 },
  strength: { label: "Strength", startLevel: 70, startExp: 0 },
  agility: { label: "Agility", startLevel: 1, startExp: 0 },
  dexterity: { label: "Dexterity", startLevel: 1, startExp: 0 }
};

export const EXP_TABLE = Array.from(
  { length: MAX_SKILL_LEVEL + 1 },
  (_, level) => {
    if (level === 0) return 0;
    return Math.floor(100 + level * 20 + level * level * 5);
  }
);