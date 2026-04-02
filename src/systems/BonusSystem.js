// src/systems/BonusSystem.js

import BaseSystem from "../ui/BaseSystem.js";
import { getEquipmentBaseDef } from "../data/equipmentData.js";
import { getVitaTierDef } from "../data/vitaData.js";
import {
  countConnectedFilledSlots
} from "./vita/socketLoadHelpers.js";

export default class BonusSystem extends BaseSystem {
  constructor(scene, config = {}) {
    super(scene, config);

    this.playerState = config.playerState ?? null;

    this.cachedBundle = null;
    this.cacheDirty = true;
  }

  markDirty() {
    this.cacheDirty = true;
  }

  getBonusBundle() {
    if (!this.cacheDirty && this.cachedBundle) {
      return this.cachedBundle;
    }

    const bundle = {
      statBonuses: [],
      conversionBonuses: [],
      triggerBonuses: []
    };

    const equippedItems = this.playerState?.getEquippedItems?.() ?? [];

    for (const item of equippedItems) {
      this.collectBaseEquipmentBonuses(item, bundle);
      this.collectSocketedVitaBonuses(item, bundle);
    }

    this.cachedBundle = bundle;
    this.cacheDirty = false;

    return bundle;
  }

  collectBaseEquipmentBonuses(item, bundle) {
    const baseDef = getEquipmentBaseDef(item?.baseEquipmentDefId);
    if (!baseDef?.baseStats) {
      return;
    }

    for (const [statId, value] of Object.entries(baseDef.baseStats)) {
      bundle.statBonuses.push({
        source: "base_equipment",
        stat: statId,
        mode: "add",
        value
      });
    }
  }

  collectSocketedVitaBonuses(item, bundle) {
    const casing = item?.casing;
    const socketLoad = item?.socketLoad;

    if (!casing || !socketLoad) {
      return;
    }

    for (const [socketId, socketEntry] of Object.entries(socketLoad)) {
      if (!socketEntry) {
        continue;
      }

      const vitaTierDef = getVitaTierDef(socketEntry.enemyType, socketEntry.tier);
      if (!vitaTierDef) {
        continue;
      }

      const context = this.buildSocketContext(item, socketId, socketEntry);

      this.collectPerChargeBonuses(vitaTierDef, socketEntry, context, bundle);
      this.collectConnectionBonuses(vitaTierDef, context, bundle);
      this.collectAlphaBonus(vitaTierDef, context, bundle);
    }
  }

  buildSocketContext(item, socketId, socketEntry) {
    const casing = item?.casing;
    const socketLoad = item?.socketLoad ?? {};

    return {
      item,
      casing,
      socketId,
      socketEntry,
      connectedCount: countConnectedFilledSlots(casing, socketLoad, socketId)
    };
  }

  collectPerChargeBonuses(vitaTierDef, socketEntry, context, bundle) {
    const perChargeBonuses = vitaTierDef?.perChargeBonuses ?? [];
    const charges = Math.max(0, socketEntry?.charges ?? 0);

    for (const bonus of perChargeBonuses) {
      if (bonus.type === "stat") {
        const totalValue = (bonus.valuePerCharge ?? 0) * charges;

        bundle.statBonuses.push({
          source: "vita_per_charge",
          enemyType: socketEntry.enemyType,
          tier: socketEntry.tier,
          socketId: context.socketId,
          stat: bonus.stat,
          mode: bonus.mode ?? "add",
          value: totalValue
        });
      }

      if (bonus.type === "conversion") {
        const totalValue = this.scalePerChargeConversionValue(
          bonus.mode ?? "add",
          bonus.valuePerCharge ?? 0,
          charges
        );

        bundle.conversionBonuses.push({
          source: "vita_per_charge",
          enemyType: socketEntry.enemyType,
          tier: socketEntry.tier,
          socketId: context.socketId,
          effectType: bonus.effectType,
          mode: bonus.mode ?? "add",
          value: totalValue
        });
      }

      if (bonus.type === "trigger") {
        bundle.triggerBonuses.push(
          this.buildScaledTriggerBonus(bonus, socketEntry, context)
        );
      }
    }
  }

  collectConnectionBonuses(vitaTierDef, context, bundle) {
    const connectionBonuses = vitaTierDef?.connectionBonuses ?? [];

    for (const rule of connectionBonuses) {
      const required = rule.minConnected ?? 1;

      if ((context.connectedCount ?? 0) < required) {
        continue;
      }

      this.pushResolvedBonus(rule.bonus, context, bundle, "vita_connection");
    }
  }

  collectAlphaBonus(vitaTierDef, context, bundle) {
    const alphaBonus = vitaTierDef?.alphaBonus;
    if (!alphaBonus?.condition || !alphaBonus?.bonus) {
      return;
    }

    if (!this.isAlphaConditionMet(alphaBonus.condition, context)) {
      return;
    }

    this.pushResolvedBonus(alphaBonus.bonus, context, bundle, "vita_alpha");
  }

  isAlphaConditionMet(condition, context) {
    const connectedCount = context.connectedCount ?? 0;

    switch (condition.type) {
      case "isolated":
        return connectedCount === 0;

      case "connected_count_at_least":
        return connectedCount >= (condition.value ?? 1);

      case "connected_count_exact":
        return connectedCount === (condition.value ?? 0);

      case "connected_count_at_most":
        return connectedCount <= (condition.value ?? 0);

      default:
        return false;
    }
  }

  pushResolvedBonus(bonus, context, bundle, source) {
    if (!bonus) {
      return;
    }

    if (bonus.type === "stat") {
      bundle.statBonuses.push({
        source,
        enemyType: context.socketEntry.enemyType,
        tier: context.socketEntry.tier,
        socketId: context.socketId,
        stat: bonus.stat,
        mode: bonus.mode ?? "add",
        value: bonus.value ?? 0
      });
      return;
    }

    if (bonus.type === "conversion") {
      bundle.conversionBonuses.push({
        source,
        enemyType: context.socketEntry.enemyType,
        tier: context.socketEntry.tier,
        socketId: context.socketId,
        effectType: bonus.effectType,
        mode: bonus.mode ?? "add",
        value: bonus.value ?? 0
      });
      return;
    }

    if (bonus.type === "trigger") {
      bundle.triggerBonuses.push({
        source,
        enemyType: context.socketEntry.enemyType,
        tier: context.socketEntry.tier,
        socketId: context.socketId,
        trigger: bonus.trigger,
        chance: bonus.chance ?? 1,
        effect: { ...(bonus.effect ?? {}) }
      });
    }
  }

  buildScaledTriggerBonus(bonus, socketEntry, context) {
    const charges = Math.max(0, socketEntry?.charges ?? 0);
    const effect = { ...(bonus.effect ?? {}) };

    if (typeof effect.valuePerCharge === "number") {
      effect.value = (effect.valuePerCharge ?? 0) * charges;
      delete effect.valuePerCharge;
    }

    let chance = bonus.chance ?? 1;

    if (typeof bonus.chancePerCharge === "number") {
      chance += bonus.chancePerCharge * charges;
    }

    chance = Math.max(0, Math.min(1, chance));

    return {
      source: "vita_per_charge",
      enemyType: socketEntry.enemyType,
      tier: socketEntry.tier,
      socketId: context.socketId,
      trigger: bonus.trigger,
      chance,
      effect
    };
  }

  scalePerChargeConversionValue(mode, valuePerCharge, charges) {
    if (mode === "mult") {
      return 1 + valuePerCharge * charges;
    }

    return valuePerCharge * charges;
  }

  getStat(statId, baseValue = 0, context = {}) {
    let value = baseValue;

    for (const bonus of this.getBonusBundle().statBonuses) {
      if (bonus.stat !== statId) {
        continue;
      }

      if (bonus.mode === "add") {
        value += bonus.value;
      } else if (bonus.mode === "mult") {
        value *= bonus.value;
      }
    }

    return value;
  }

  getStatsMap(baseStats = {}, context = {}) {
    const result = {};

    for (const [statId, baseValue] of Object.entries(baseStats)) {
      result[statId] = this.getStat(statId, baseValue, context);
    }

    return result;
  }

  modifyValue(effectType, baseValue, context = {}) {
    let value = baseValue;

    for (const bonus of this.getBonusBundle().conversionBonuses) {
      if (bonus.effectType !== effectType) {
        continue;
      }

      if (bonus.mode === "add") {
        value += bonus.value;
      } else if (bonus.mode === "mult") {
        value *= bonus.value;
      }
    }

    return value;
  }

  getTriggeredEffects(triggerType, context = {}) {
    return this.getBonusBundle().triggerBonuses.filter((bonus) => {
      return bonus.trigger === triggerType;
    });
  }

  applyTriggers(triggerType, context = {}) {
    const results = [];

    for (const trigger of this.getTriggeredEffects(triggerType, context)) {
      const chance = trigger.chance ?? 1;

      if (Math.random() > chance) {
        continue;
      }

      results.push({
        ...trigger.effect,
        _triggerMeta: {
          source: trigger.source,
          enemyType: trigger.enemyType,
          tier: trigger.tier,
          socketId: trigger.socketId
        }
      });
    }

    return results;
  }

  getDebugBonusBreakdown() {
    return this.getBonusBundle();
  }
}