import { SKILL_DEFS, EXP_TABLE, MAX_SKILL_LEVEL } from "../data/playerSkillsData.js";

const BASE_STAT_IDS = [
  "maxHealth",
  "attack",
  "defense",
  "speed",
  "accuracy",
  "evasion"
];

export default class PlayerState {
  constructor() {
    this.inventory = [];
    this.maxSlots = 20;

    this.skills = this.createDefaultSkills();

    this.equipmentSlots = {
      sword: null,
      armor: null,
      accessory1: null,
      accessory2: null
    };

    this.vitaLedger = {};

    this.currentHealth = 10;
  }

  createDefaultSkills() {
    const skills = {};

    Object.entries(SKILL_DEFS).forEach(([skillId, def]) => {
      skills[skillId] = {
        level: def.startLevel ?? 1,
        exp: def.startExp ?? 0
      };
    });

    return skills;
  }

  // -------------------------
  // INVENTORY
  // -------------------------

  isInventoryFull() {
    return this.inventory.length >= this.maxSlots;
  }

  hasInventorySpace(amount = 1) {
    return this.inventory.length + amount <= this.maxSlots;
  }

  canReceiveItems(items = []) {
    return this.inventory.length + items.length <= this.maxSlots;
  }

  addItem(item) {
    if (!this.hasInventorySpace(1)) {
      return false;
    }

    this.inventory.push(item);
    return true;
  }

  addItems(items = []) {
    if (!this.canReceiveItems(items)) {
      return false;
    }

    this.inventory.push(...items);
    return true;
  }

  removeItem(itemId) {
    const index = this.inventory.findIndex((item) => item.id === itemId);

    if (index === -1) {
      return false;
    }

    this.inventory.splice(index, 1);
    return true;
  }

  hasItem(itemId) {
    return this.inventory.some((item) => item.id === itemId);
  }

  countItem(itemId) {
    return this.inventory.filter((item) => item.id === itemId).length;
  }

  // -------------------------
  // SKILLS
  // -------------------------

  getSkill(skillId) {
    if (!this.skills[skillId]) {
      this.skills[skillId] = { level: 1, exp: 0 };
    }

    return this.skills[skillId];
  }

  getSkillLevel(skillId) {
    return this.getSkill(skillId).level;
  }

  getSkillExp(skillId) {
    return this.getSkill(skillId).exp;
  }

  hasSkillLevel(skillId, requiredLevel) {
    return this.getSkillLevel(skillId) >= requiredLevel;
  }

  getExpNeededForNextLevel(skillId) {
    const skill = this.getSkill(skillId);

    if (skill.level >= MAX_SKILL_LEVEL) {
      return 0;
    }

    return EXP_TABLE[skill.level];
  }

  addSkillExp(skillId, amount) {
    const skill = this.getSkill(skillId);

    if (skill.level >= MAX_SKILL_LEVEL) {
      return {
        leveledUp: false,
        levelsGained: 0,
        level: skill.level,
        exp: skill.exp
      };
    }

    skill.exp += amount;

    let levelsGained = 0;

    while (skill.level < MAX_SKILL_LEVEL) {
      const expNeeded = EXP_TABLE[skill.level];

      if (skill.exp < expNeeded) {
        break;
      }

      skill.exp -= expNeeded;
      skill.level += 1;
      levelsGained += 1;
    }

    if (skill.level >= MAX_SKILL_LEVEL) {
      skill.level = MAX_SKILL_LEVEL;
      skill.exp = 0;
    }

    return {
      leveledUp: levelsGained > 0,
      levelsGained,
      level: skill.level,
      exp: skill.exp
    };
  }

  setSkillLevel(skillId, level) {
    const skill = this.getSkill(skillId);
    skill.level = Math.max(1, Math.min(level, MAX_SKILL_LEVEL));

    if (skill.level >= MAX_SKILL_LEVEL) {
      skill.exp = 0;
    }
  }

  setSkillExp(skillId, exp) {
    const skill = this.getSkill(skillId);
    skill.exp = Math.max(0, exp);
  }

  // -------------------------
  // EQUIPMENT
  // -------------------------

  getEquippedItems() {
    return Object.values(this.equipmentSlots).filter(Boolean);
  }

  getEquippedItem(slotId) {
    return this.equipmentSlots[slotId] ?? null;
  }

  equipItem(slotId, itemInstance) {
    this.equipmentSlots[slotId] = itemInstance;
  }

  unequipItem(slotId) {
    const current = this.equipmentSlots[slotId] ?? null;
    this.equipmentSlots[slotId] = null;
    return current;
  }

  hasEquippedItem(slotId) {
    return this.getEquippedItem(slotId) !== null;
  }

  // -------------------------
  // VITA
  // -------------------------

  getVitaLedger() {
    return this.vitaLedger;
  }

  // -------------------------
  // BASE / DERIVED STATS
  // -------------------------

  getBaseStats() {
    const vigor = this.getSkillLevel("vigor");
    const endurance = this.getSkillLevel("endurance");
    const strength = this.getSkillLevel("strength");
    const agility = this.getSkillLevel("agility");
    const dexterity = this.getSkillLevel("dexterity");

    return {
      maxHealth: 10 + vigor * 2,
      attack: 1 + strength * 2,
      defense: 1 + endurance,
      speed: 15 + agility * 0.5 + dexterity * 0.5,
      accuracy: 1 + dexterity * 2,
      evasion: 1 + agility * 2
    };
  }

  getStats(bonusSystem = null, context = {}) {
    const baseStats = this.getBaseStats();

    const resolvedStats = bonusSystem?.getStatsMap
      ? bonusSystem.getStatsMap(baseStats, context)
      : { ...baseStats };

    const maxHealth = Math.max(1, resolvedStats.maxHealth ?? baseStats.maxHealth);

    return {
      health: Math.max(0, Math.min(this.currentHealth, maxHealth)),
      maxHealth,
      attack: resolvedStats.attack ?? baseStats.attack,
      defense: resolvedStats.defense ?? baseStats.defense,
      speed: resolvedStats.speed ?? baseStats.speed,
      accuracy: resolvedStats.accuracy ?? baseStats.accuracy,
      evasion: resolvedStats.evasion ?? baseStats.evasion
    };
  }

  getBaseStat(statId) {
    return this.getBaseStats()[statId] ?? 0;
  }

  getResolvedStat(statId, bonusSystem = null, context = {}) {
    const baseValue = this.getBaseStat(statId);

    if (!bonusSystem?.getStat) {
      return baseValue;
    }

    return bonusSystem.getStat(statId, baseValue, context);
  }

  getResolvedStatsMap(bonusSystem = null, context = {}) {
    const stats = this.getStats(bonusSystem, context);
    const result = {};

    for (const statId of BASE_STAT_IDS) {
      result[statId] = stats[statId];
    }

    return result;
  }

  // -------------------------
  // HEALTH
  // -------------------------

  setCurrentHealth(value, bonusSystem = null, context = {}) {
    const stats = this.getStats(bonusSystem, context);
    this.currentHealth = Math.max(0, Math.min(value, stats.maxHealth));
  }

  heal(amount, bonusSystem = null, context = {}) {
    this.setCurrentHealth(this.currentHealth + amount, bonusSystem, context);
  }

  takeDamage(amount, bonusSystem = null, context = {}) {
    this.setCurrentHealth(this.currentHealth - amount, bonusSystem, context);
  }

  isDead() {
    return this.currentHealth <= 0;
  }

  restoreToFullHealth(bonusSystem = null, context = {}) {
    this.currentHealth = this.getStats(bonusSystem, context).maxHealth;
  }
}