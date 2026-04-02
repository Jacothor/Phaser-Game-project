import Phaser from "phaser";

export default class CombatSystem {
  constructor(scene, config = {}) {
    this.scene = scene;

    this.eventBus = config.eventBus ?? null;

    this.battlePanel = config.battlePanel ?? null;
    this.playerPanel = config.playerPanel ?? null;
    this.playerState = config.playerState ?? null;
    this.playerWorldState = config.playerWorldState ?? null;
    this.mapUI = config.mapUI ?? null;
    this.lootSystem = config.lootSystem ?? null;
    this.lootPanel = config.lootPanel ?? null;
    this.bonusSystem = config.bonusSystem ?? null;
    this.syphonSystem = config.syphonSystem ?? null;

    this.isBattleActive = false;
    this.currentBattle = null;

    this.GAUGE_MAX = 100;
    this.MIN_ACTION_TIME = 1;
    this.MAX_ACTION_TIME = 5;
    this.SPEED_CURVE_K = 20;

    this.BASE_HIT_CHANCE = 75;
    this.HIT_CHANCE_FACTOR = 0.5;
    this.MIN_HIT_CHANCE = 25;
    this.MAX_HIT_CHANCE = 95;

    this.DAMAGE_ATTACK_SCALAR = 0.2;
    this.DAMAGE_DEFENSE_K = 100;
  }

  emit(type, payload = {}, meta = {}) {
    this.eventBus?.emit?.(type, payload, {
      source: "combat_system",
      ...meta,
    });
  }

  startBattle({ enemyId, enemyData, nodeData = null, node = null }) {
    if (this.isBattleActive) {
      console.warn("CombatSystem: battle already active.");
      return false;
    }

    if (!this.playerState) {
      console.warn("CombatSystem: missing playerState.");
      return false;
    }

    if (!enemyId || !enemyData) {
      console.warn("CombatSystem: missing enemy data.");
      return false;
    }

    const playerStats = this.playerState.getStats(this.bonusSystem);
    const enemyStats = this.buildEnemyStats(enemyData);

    this.currentBattle = {
      enemyId,
      enemyData,
      nodeData,
      node,
      startedAt: Date.now(),
      result: null,
      turnCount: 0,
      log: [],

      player: {
        id: "player",
        name: "Player",
        ...playerStats,
        gauge: 0,
        actionTime: this.getActionTimeSeconds(playerStats.speed),
        gaugeFillPerSecond: this.getGaugeFillPerSecond(playerStats.speed),
      },

      enemy: {
        id: enemyId,
        name: enemyData.name || enemyId,
        ...enemyStats,
        gauge: 0,
        actionTime: this.getActionTimeSeconds(enemyStats.speed),
        gaugeFillPerSecond: this.getGaugeFillPerSecond(enemyStats.speed),
      },
    };

    this.currentBattle.node?.pausePatrol?.();

    this.isBattleActive = true;

    this.mapUI?.setBattleLocked?.(true);

    this.battlePanel?.setEnemy?.(enemyId);
    this.battlePanel?.show?.();

    this.playerPanel?.enterBattleStance?.();

    this.syncBattlePresentation();

    this.addLogEntry(
      `Battle started against ${this.currentBattle.enemy.name}.`,
    );

    this.emit("combat.started", {
      battle: this.currentBattle,
      enemyId,
      nodeId: nodeData?.id ?? null,
    });

    return true;
  }

  buildEnemyStats(enemyData) {
    const maxHealth = enemyData.health ?? 1;

    return {
      health: maxHealth,
      maxHealth,
      attack: enemyData.attack ?? 1,
      defense: enemyData.defense ?? 0,
      speed: enemyData.speed ?? 1,
      accuracy: enemyData.accuracy ?? 1,
      evasion: enemyData.evasion ?? 1,
    };
  }

  endBattle(result = "unknown") {
    if (!this.isBattleActive || !this.currentBattle) {
      return;
    }

    this.currentBattle.result = result;

    if (result === "player_win") {
      this.addLogEntry("You won the battle.");
    } else if (result === "player_lose") {
      this.addLogEntry("You were defeated.");
    } else {
      this.addLogEntry("The battle ended.");
    }

    this.syncBattlePresentation();

    this.emit("combat.ended", {
      battle: this.currentBattle,
      result,
      enemyId: this.currentBattle.enemyId,
      nodeId: this.currentBattle.nodeData?.id ?? null,
    });

    if (result === "player_win" && this.battlePanel?.enemySprite) {
      this.isBattleActive = false;

      this.battlePanel.enemySprite.once("animationcomplete", () => {
        this.finishBattlePresentation();
      });

      this.battlePanel.playEnemyAnim("die");
      return;
    }

    if (result === "player_win") {
      this.isBattleActive = false;
      this.finishBattlePresentation();
      return;
    }

    if (result === "player_lose") {
      this.isBattleActive = false;

      if (this.playerPanel?.playDeathAnim) {
        this.scene.time.delayedCall(500, () => {
          this.playerPanel?.playDeathAnim?.();
        });
      }

      this.scene.time.delayedCall(1000, () => {
        this.finishBattlePresentation();
      });

      return;
    }

    this.isBattleActive = false;
    this.finishBattlePresentation();
  }

  clearBattle() {
    this.currentBattle = null;
  }

  update(delta) {
    if (!this.isBattleActive || !this.currentBattle) {
      return;
    }

    const deltaSeconds = delta / 1000;
    const { player, enemy } = this.currentBattle;

    this.syncPlayerFromState();
    this.refreshCombatantTiming(player);
    this.refreshCombatantTiming(enemy);

    this.fillGauge(player, deltaSeconds);
    this.fillGauge(enemy, deltaSeconds);

    this.syncBattlePresentation();

    while (player.gauge >= this.GAUGE_MAX && this.isBattleActive) {
      this.resolveReadyCombatant(player, enemy);

      if (!this.isBattleActive) {
        break;
      }
    }

    while (enemy.gauge >= this.GAUGE_MAX && this.isBattleActive) {
      this.resolveReadyCombatant(enemy, player);

      if (!this.isBattleActive) {
        break;
      }
    }
  }

  syncPlayerFromState() {
    if (!this.currentBattle || !this.playerState) {
      return;
    }

    const livePlayerStats = this.playerState.getStats(this.bonusSystem);

    this.currentBattle.player.health = livePlayerStats.health;
    this.currentBattle.player.maxHealth = livePlayerStats.maxHealth;
    this.currentBattle.player.attack = livePlayerStats.attack;
    this.currentBattle.player.defense = livePlayerStats.defense;
    this.currentBattle.player.speed = livePlayerStats.speed;
    this.currentBattle.player.accuracy = livePlayerStats.accuracy;
    this.currentBattle.player.evasion = livePlayerStats.evasion;
  }

  refreshCombatantTiming(combatant) {
    combatant.actionTime = this.getActionTimeSeconds(combatant.speed);
    combatant.gaugeFillPerSecond = this.GAUGE_MAX / combatant.actionTime;
  }

  fillGauge(combatant, deltaSeconds) {
    combatant.gauge += combatant.gaugeFillPerSecond * deltaSeconds;

    const maxOverflow = this.GAUGE_MAX * 2;
    if (combatant.gauge > maxOverflow) {
      combatant.gauge = maxOverflow;
    }
  }

  resolveReadyCombatant(attacker, defender) {
    if (!this.isBattleActive || !this.currentBattle) {
      return;
    }

    if (attacker.health <= 0 || defender.health <= 0) {
      return;
    }

    attacker.gauge -= this.GAUGE_MAX;
    this.currentBattle.turnCount += 1;

    const attackResult = this.resolveBasicAttack(attacker, defender);
    this.showCombatImpact(attackResult);

    if (attacker.id === "player") {
      this.playerPanel?.playAttackAnim?.();
    } else {
      this.battlePanel?.playEnemyAnim?.("attack");
    }

    this.syncBattlePresentation();

    this.emit("combat.turn_resolved", {
      battle: this.currentBattle,
      attackResult,
    });

    this.checkBattleEnd();
  }

  resolveBasicAttack(attacker, defender) {
    const hitChance = this.getHitChancePercent(attacker, defender);
    const hitRoll = Phaser.Math.Between(1, 100);
    const hit = hitRoll <= hitChance;

    if (!hit) {
      const missMessage = `${attacker.name} attacks ${defender.name} but misses.`;
      this.addLogEntry(missMessage);

      if (defender.id === "player") {
        this.playerPanel?.playGuardAnim?.();
      }

      this.applyTriggers("onMiss", {
        attacker,
        defender,
        hit: false,
        damage: 0,
      });

      return {
        type: "attack",
        attackerId: attacker.id,
        defenderId: defender.id,
        hit: false,
        hitRoll,
        hitChance,
        damage: 0,
        defenderHealth: defender.health,
        defenderMaxHealth: defender.maxHealth,
      };
    }

    const damage = this.calculateFinalDamage(attacker, defender);

    if (defender.id === "player") {
      this.playerState.takeDamage(damage, this.bonusSystem);
      this.syncPlayerFromState();

      if (this.currentBattle.player.health > 0) {
        this.playerPanel?.playDamageAnim?.();
      }
    } else {
      defender.health = Math.max(0, defender.health - damage);
    }

    const hitMessage = `${attacker.name} hits ${defender.name} for ${damage} damage.`;
    this.addLogEntry(hitMessage);

    this.applyTriggers("onHit", {
      attacker,
      defender,
      hit: true,
      damage,
    });

    if (defender.id === "player") {
      this.applyTriggers("onTakeDamage", {
        attacker,
        defender,
        hit: true,
        damage,
      });
    }

    const killed = defender.health <= 0;
    if (killed) {
      this.applyTriggers("onKill", {
        attacker,
        defender,
        hit: true,
        damage,
      });
    }

    return {
      type: "attack",
      attackerId: attacker.id,
      defenderId: defender.id,
      hit: true,
      hitRoll,
      hitChance,
      damage,
      defenderHealth: defender.health,
      defenderMaxHealth: defender.maxHealth,
    };
  }

  getHitChancePercent(attacker, defender) {
    const accuracy = attacker.accuracy ?? 0;
    const evasion = defender.evasion ?? 0;

    const hitChance =
      this.BASE_HIT_CHANCE + (accuracy - evasion) * this.HIT_CHANCE_FACTOR;

    return Phaser.Math.Clamp(
      Math.round(hitChance),
      this.MIN_HIT_CHANCE,
      this.MAX_HIT_CHANCE,
    );
  }

  calculateDamage(attacker, defender) {
    const attack = Math.max(0, attacker.attack ?? 0);
    const defense = Math.max(0, defender.defense ?? 0);

    const scaledAttack = attack * this.DAMAGE_ATTACK_SCALAR;
    const mitigation =
      this.DAMAGE_DEFENSE_K / (this.DAMAGE_DEFENSE_K + defense);

    const rawDamage = 1 + scaledAttack * mitigation;
    const damage = Math.floor(rawDamage);

    return Math.max(1, damage);
  }

  calculateFinalDamage(attacker, defender) {
    const baseDamage = this.calculateDamage(attacker, defender);

    if (attacker.id !== "player" || !this.bonusSystem) {
      return Math.max(1, baseDamage);
    }

    const modifiedDamage = this.bonusSystem.modifyValue("damage", baseDamage, {
      attackerId: attacker.id,
      defenderId: defender.id,
    });

    return Math.max(1, Math.floor(modifiedDamage));
  }

  applyTriggers(triggerType, context = {}) {
    if (!this.bonusSystem) {
      return;
    }

    const attacker = context.attacker ?? null;
    const effects = this.bonusSystem.applyTriggers(triggerType, context);

    for (const effect of effects) {
      if (!effect) continue;

      if (effect.kind === "heal") {
        const baseHeal = effect.value ?? 0;
        const finalHeal = this.bonusSystem.modifyValue("heal", baseHeal, {
          triggerType,
          ...context,
        });

        if (attacker?.id === "player") {
          this.playerState.heal(finalHeal, this.bonusSystem);
          this.syncPlayerFromState();
          this.addLogEntry(`Player heals ${Math.floor(finalHeal)}.`);
        }
      }
    }
  }

  checkBattleEnd() {
    if (!this.isBattleActive || !this.currentBattle) {
      return;
    }

    const { player, enemy } = this.currentBattle;

    if (enemy.health <= 0) {
      this.endBattle("player_win");
      return;
    }

    if (player.health <= 0) {
      this.endBattle("player_lose");
    }
  }

  showCombatImpact(attackResult) {
    if (!attackResult) {
      return;
    }

    const targetPanel =
      attackResult.defenderId === "player"
        ? this.playerPanel
        : this.battlePanel;

    targetPanel?.showDamageEffect?.({
      hit: attackResult.hit,
      damage: attackResult.damage,
    });
  }

  finishBattlePresentation() {
    if (!this.currentBattle) {
      return;
    }

    const result = this.currentBattle.result;
    const nodeData = this.currentBattle.nodeData;
    const enemyData = this.currentBattle.enemyData;
    const enemyId = this.currentBattle.enemyId;

    if (result === "player_win" && nodeData && this.playerWorldState) {
      const nodeId = nodeData.id;
      const respawnTime =
        nodeData.worldRules?.returnTime ?? enemyData?.respawn ?? 10000;
      const returnState =
        nodeData.worldRules?.returnState ?? nodeData.defaultState ?? "default";

      this.playerWorldState.setNodeState(nodeId, "hidden");
      this.mapUI?.refreshFromWorldState?.();

      this.scene.time.delayedCall(respawnTime, () => {
        if (!this.playerWorldState) {
          return;
        }

        this.playerWorldState.setNodeState(nodeId, returnState);
        this.mapUI?.refreshFromWorldState?.();

        const respawnedNode = this.mapUI?.getNodeById?.(nodeId);
        respawnedNode?.resumePatrol?.();

        this.emit("combat.node_respawned", {
          nodeId,
          returnState,
          respawnTime,
        });
      });
    }

    this.battlePanel?.hide?.();

    if (result === "player_win") {
      this.lootSystem?.generateLootFromEnemy?.(enemyId);

      this.emit("combat.loot_generated", {
        enemyId,
      });

      const syphonResult = this.syphonSystem?.trySyphonFromEnemy?.(enemyId, {
        source: "combat_win",
        battle: this.currentBattle,
      });

      if (syphonResult?.success) {
        this.addLogEntry(
          `Syphoned ${syphonResult.chargesGained} ${syphonResult.enemyType} vita charge(s).`,
        );
      } else if (syphonResult?.ok) {
        this.addLogEntry("Syphon failed.");
      }
    }

    this.playerPanel?.exitBattleStance?.();
    this.playerPanel?.syncBattleState?.(null);

    this.mapUI?.setBattleLocked?.(false);

    this.clearBattle();
  }

  syncBattlePresentation() {
    this.battlePanel?.syncBattleState?.(this.currentBattle);
    this.playerPanel?.syncBattleState?.(this.currentBattle);
  }

  addLogEntry(message) {
    if (!this.currentBattle) {
      return;
    }

    this.currentBattle.log.push(message);

    if (this.currentBattle.log.length > 20) {
      this.currentBattle.log.shift();
    }
  }

  getActionTimeSeconds(speed) {
    const safeSpeed = Math.max(0, speed ?? 0);
    const ratio = safeSpeed / (safeSpeed + this.SPEED_CURVE_K);
    const actionTime =
      this.MAX_ACTION_TIME -
      ratio * (this.MAX_ACTION_TIME - this.MIN_ACTION_TIME);

    return Phaser.Math.Clamp(
      actionTime,
      this.MIN_ACTION_TIME,
      this.MAX_ACTION_TIME,
    );
  }

  getGaugeFillPerSecond(speed) {
    return this.GAUGE_MAX / this.getActionTimeSeconds(speed);
  }
}
