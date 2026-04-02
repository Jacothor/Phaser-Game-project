export const VITA_ENEMY_TYPES = {
  WOLF: "wolf",
  SLIME: "slime",
  BANDIT: "bandit",
  KNIGHT: "knight"
};

export const VITA_MAX_CHARGES = 99;

export const VITA_EFFECT_TYPES = {
  STAT: "stat",
  TRIGGER: "trigger",
  CONVERSION: "conversion"
};

export const VITA_TRIGGER_TYPES = {
  ON_HIT: "onHit",
  ON_MISS: "onMiss",
  ON_KILL: "onKill",
  ON_TAKE_DAMAGE: "onTakeDamage",
  ON_HEAL: "onHeal",
  ON_GATHER_COMPLETE: "onGatherComplete",
  ON_PROCESS_COMPLETE: "onProcessComplete",
  ON_SYPHON_SUCCESS: "onSyphonSuccess"
};

/*
Schema:

wolf: {
  enemyType: "wolf",
  displayName: "Vita: Wolf",
  iconKey: "vita_wolf",
  tiers: {
    1: {
      perChargeBonuses: [],
      connectionBonuses: [],
      alphaBonus: null
    }
  }
}
*/

export const VITA_DATA = {
  wolf: {
    enemyType: VITA_ENEMY_TYPES.WOLF,
    displayName: "Vita: Wolf",
    iconKey: "vita_wolf",

    tiers: {
      1: {
        perChargeBonuses: [
          {
            type: VITA_EFFECT_TYPES.STAT,
            stat: "attack",
            mode: "add",
            valuePerCharge: 0.05
          }
        ],
        connectionBonuses: [
          {
            minConnected: 2,
            bonus: {
              type: VITA_EFFECT_TYPES.CONVERSION,
              effectType: "damage",
              mode: "mult",
              value: 1.05
            }
          }
        ],
        alphaBonus: {
          condition: {
            type: "connected_count_at_least",
            value: 3
          },
          bonus: {
            type: VITA_EFFECT_TYPES.CONVERSION,
            effectType: "damage",
            mode: "mult",
            value: 1.08
          }
        }
      },

      2: {
        perChargeBonuses: [
          {
            type: VITA_EFFECT_TYPES.STAT,
            stat: "attack",
            mode: "add",
            valuePerCharge: 0.08
          }
        ],
        connectionBonuses: [
          {
            minConnected: 2,
            bonus: {
              type: VITA_EFFECT_TYPES.CONVERSION,
              effectType: "damage",
              mode: "mult",
              value: 1.08
            }
          }
        ],
        alphaBonus: {
          condition: {
            type: "connected_count_at_least",
            value: 3
          },
          bonus: {
            type: VITA_EFFECT_TYPES.CONVERSION,
            effectType: "damage",
            mode: "mult",
            value: 1.12
          }
        }
      }
    }
  },

  slime: {
    enemyType: VITA_ENEMY_TYPES.SLIME,
    displayName: "Vita: Slime",
    iconKey: "vita_slime",

    tiers: {
      1: {
        perChargeBonuses: [
          {
            type: VITA_EFFECT_TYPES.STAT,
            stat: "defense",
            mode: "add",
            valuePerCharge: 0.05
          }
        ],
        connectionBonuses: [
          {
            minConnected: 2,
            bonus: {
              type: VITA_EFFECT_TYPES.STAT,
              stat: "maxHealth",
              mode: "add",
              value: 2
            }
          }
        ],
        alphaBonus: {
          condition: {
            type: "isolated",
            value: 0
          },
          bonus: {
            type: VITA_EFFECT_TYPES.TRIGGER,
            trigger: VITA_TRIGGER_TYPES.ON_TAKE_DAMAGE,
            chance: 0.15,
            effect: {
              kind: "heal",
              value: 1
            }
          }
        }
      }
    }
  },

  bandit: {
    enemyType: VITA_ENEMY_TYPES.BANDIT,
    displayName: "Vita: Bandit",
    iconKey: "vita_bandit",

    tiers: {
      1: {
        perChargeBonuses: [
          {
            type: VITA_EFFECT_TYPES.STAT,
            stat: "accuracy",
            mode: "add",
            valuePerCharge: 0.05
          }
        ],
        connectionBonuses: [
          {
            minConnected: 2,
            bonus: {
              type: VITA_EFFECT_TYPES.STAT,
              stat: "evasion",
              mode: "add",
              value: 1
            }
          }
        ],
        alphaBonus: {
          condition: {
            type: "connected_count_at_least",
            value: 4
          },
          bonus: {
            type: VITA_EFFECT_TYPES.CONVERSION,
            effectType: "syphonChance",
            mode: "mult",
            value: 1.1
          }
        }
      }
    }
  }
};

export function getVitaDef(enemyType) {
  return VITA_DATA[enemyType] ?? null;
}

export function getVitaTierDef(enemyType, tier) {
  const vitaDef = getVitaDef(enemyType);
  return vitaDef?.tiers?.[tier] ?? null;
}