import BaseSystem from "../ui/BaseSystem.js";
import { ENEMY_DATA } from "../data/enemiesData.js";
import {
  addVitaCharges,
  ensureVitaLedgerEntry,
  removeVitaCharges
} from "./vita/createVitaLedger.js";

export default class SyphonSystem extends BaseSystem {
  constructor(scene, config = {}) {
    super(scene, config);

    this.playerState = config.playerState ?? null;
    this.bonusSystem = config.bonusSystem ?? null;

    this.SYPHON_SKILL_ID = "syphoning";

    // tuning values
    this.SKILL_CHANCE_PER_LEVEL = 0.003;
    this.TIER_CHANCE_PENALTY = 0.05;

    // consume-for-xp rule: xp depends on tier only
    this.XP_PER_TIER = {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10
    };
  }

  resolveEnemySyphonData(enemyId) {
    const enemyData = ENEMY_DATA[enemyId] ?? null;
    if (!enemyData) {
      return null;
    }

    return {
      enemyId,
      enemyType: enemyData.enemyType ?? null,
      vitaTier: enemyData.vitaTier ?? 1,
      baseChance: enemyData.syphon?.baseChance ?? 0,
      chargesMin: enemyData.syphon?.chargesMin ?? 1,
      chargesMax: enemyData.syphon?.chargesMax ?? 1,
      enemyData
    };
  }

  rollInteger(min, max) {
    const safeMin = Math.floor(Math.min(min, max));
    const safeMax = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
  }

  getSyphonSkillLevel() {
    if (!this.playerState?.getSkillLevel) {
      return 1;
    }

    return this.playerState.getSkillLevel(this.SYPHON_SKILL_ID);
  }

  getSyphonSkillChanceBonus() {
    const level = this.getSyphonSkillLevel();
    const bonus = Math.max(0, level - 1) * this.SKILL_CHANCE_PER_LEVEL;
    return bonus;
  }

  getTierPenalty(vitaTier) {
    const safeTier = Math.max(1, vitaTier ?? 1);
    return Math.max(0, safeTier - 1) * this.TIER_CHANCE_PENALTY;
  }

  getFinalSyphonChance(baseChance, context = {}) {
    const vitaTier = context.vitaTier ?? 1;

    let chance = baseChance;
    chance += this.getSyphonSkillChanceBonus();
    chance -= this.getTierPenalty(vitaTier);

    if (this.bonusSystem) {
      chance = this.bonusSystem.modifyValue("syphonChance", chance, context);
    }

    return Math.max(0, Math.min(1, chance));
  }

  getFinalChargeGain(baseCharges, context = {}) {
    let charges = baseCharges;

    if (this.bonusSystem) {
      charges = this.bonusSystem.modifyValue("vitaGain", charges, context);
    }

    return Math.max(0, Math.floor(charges));
  }

  trySyphonFromEnemy(enemyId, context = {}) {
    if (!this.playerState) {
      return {
        ok: false,
        reason: "missing_player_state"
      };
    }

    const syphonData = this.resolveEnemySyphonData(enemyId);
    if (!syphonData) {
      return {
        ok: false,
        reason: "unknown_enemy"
      };
    }

    if (!syphonData.enemyType) {
      return {
        ok: false,
        reason: "missing_enemy_type"
      };
    }

    const fullContext = {
      enemyId,
      enemyType: syphonData.enemyType,
      vitaTier: syphonData.vitaTier,
      syphonSkillLevel: this.getSyphonSkillLevel(),
      ...context
    };

    const finalChance = this.getFinalSyphonChance(
      syphonData.baseChance,
      fullContext
    );

    const roll = Math.random();
    const success = roll <= finalChance;

    if (!success) {
      this.emit("syphon.failed", {
        enemyId,
        enemyType: syphonData.enemyType,
        vitaTier: syphonData.vitaTier,
        baseChance: syphonData.baseChance,
        skillBonus: this.getSyphonSkillChanceBonus(),
        tierPenalty: this.getTierPenalty(syphonData.vitaTier),
        finalChance,
        roll
      });

      return {
        ok: true,
        success: false,
        enemyId,
        enemyType: syphonData.enemyType,
        vitaTier: syphonData.vitaTier,
        chargesGained: 0,
        finalChance,
        roll
      };
    }

    const rolledCharges = this.rollInteger(
      syphonData.chargesMin,
      syphonData.chargesMax
    );

    const finalCharges = this.getFinalChargeGain(rolledCharges, fullContext);

    const ledger = this.playerState.getVitaLedger();
    const entry = addVitaCharges(
      ledger,
      syphonData.enemyType,
      syphonData.vitaTier,
      finalCharges
    );

    this.emit("syphon.succeeded", {
      enemyId,
      enemyType: syphonData.enemyType,
      vitaTier: syphonData.vitaTier,
      baseChance: syphonData.baseChance,
      skillBonus: this.getSyphonSkillChanceBonus(),
      tierPenalty: this.getTierPenalty(syphonData.vitaTier),
      finalChance,
      roll,
      rolledCharges,
      chargesGained: finalCharges,
      totalCharges: entry.charges,
      maxCharges: entry.maxCharges
    });

    if (this.bonusSystem) {
      this.bonusSystem.applyTriggers("onSyphonSuccess", {
        enemyId,
        enemyType: syphonData.enemyType,
        vitaTier: syphonData.vitaTier,
        chargesGained: finalCharges,
        ...context
      });
    }

    return {
      ok: true,
      success: true,
      enemyId,
      enemyType: syphonData.enemyType,
      vitaTier: syphonData.vitaTier,
      chargesGained: finalCharges,
      totalCharges: entry.charges,
      maxCharges: entry.maxCharges,
      finalChance,
      roll
    };
  }

  getXpPerChargeForTier(tier) {
    return this.XP_PER_TIER[tier] ?? Math.max(1, tier ?? 1);
  }

  consumeVitaChargesForSyphonXp(enemyType, tier, chargesToConsume) {
    if (!this.playerState) {
      return {
        ok: false,
        reason: "missing_player_state"
      };
    }

    const charges = Math.max(0, Math.floor(chargesToConsume ?? 0));
    if (charges <= 0) {
      return {
        ok: false,
        reason: "invalid_charge_amount"
      };
    }

    const ledger = this.playerState.getVitaLedger();
    const entry = ensureVitaLedgerEntry(ledger, enemyType, tier);

    if (entry.charges < charges) {
      return {
        ok: false,
        reason: "not_enough_charges",
        availableCharges: entry.charges
      };
    }

    const removed = removeVitaCharges(ledger, enemyType, tier, charges);
    if (!removed) {
      return {
        ok: false,
        reason: "remove_failed"
      };
    }

    const xpPerCharge = this.getXpPerChargeForTier(tier);
    const xpGained = charges * xpPerCharge;

    const skillResult = this.playerState.addSkillExp(
      this.SYPHON_SKILL_ID,
      xpGained
    );

    this.emit("syphon.charges_consumed", {
      enemyType,
      tier,
      chargesConsumed: charges,
      xpPerCharge,
      xpGained,
      remainingCharges: entry.charges,
      skillId: this.SYPHON_SKILL_ID,
      skillResult
    });

    return {
      ok: true,
      enemyType,
      tier,
      chargesConsumed: charges,
      xpPerCharge,
      xpGained,
      remainingCharges: entry.charges,
      skillResult
    };
  }
}