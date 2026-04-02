import DraggablePanel from "./DraggablePanel.js";
import PanelStatusBar from "./PanelStatusBar.js";
import { PLAYER_ANIMATIONS, PLAYER_CONFIG, PLAYER_STATES } from "../data/playerPanelData.js";

export default class PlayerPanel extends DraggablePanel {
  constructor(scene, x, y) {
    super(scene, x, y, 260, 260, {
      depth: 5000
    });

    this.scene = scene;

    this.isInCombat = false;
    this.latestBattleState = null;

    this.layout = {
      hpBarX: -100,
      hpBarY: 60,
      gaugeBarY: 115,
      barWidth: 200,
      barHeight: 10,
      damageTextX: 0,
      damageTextY: -40
    };

    this.sprite = this.scene.add.sprite(0, -35, "player-idle-1");
    this.sprite.setScale(PLAYER_CONFIG.scale);

    this.hpBar = new PanelStatusBar(this.scene, this, {
      x: this.layout.hpBarX,
      y: this.layout.hpBarY,
      width: this.layout.barWidth,
      height: this.layout.barHeight,
      fillColor: 0x4caf50,
      showTooltip: true,
      tooltipFormatter: (value, max) => `${value} / ${max}`
    });

    this.gaugeBar = new PanelStatusBar(this.scene, this, {
      x: this.layout.hpBarX,
      y: this.layout.gaugeBarY,
      width: this.layout.barWidth,
      height: this.layout.barHeight,
      fillColor: 0x66ccff,
      showTooltip: false
    });

    this.add(this.sprite);

    this.currentState = null;
    this.defaultNonCombatState = PLAYER_CONFIG.defaultState;

    this.setState(PLAYER_CONFIG.defaultState);
    this.refreshUI();
  }

  setState(state) {
    if (this.currentState === state) {
      return;
    }

    const anim = PLAYER_ANIMATIONS[state];
    if (!anim) {
      console.warn(`Unknown player animation state: ${state}`);
      return;
    }

    this.currentState = state;
    this.sprite.play(anim.key);
  }

  playOneShotState(state, fallbackState = null) {
    const anim = PLAYER_ANIMATIONS[state];
    if (!anim) {
      console.warn(`Unknown one-shot animation state: ${state}`);
      return;
    }

    this.currentState = state;
    this.sprite.play(anim.key);

    if (anim.repeat === 0 && fallbackState) {
      this.sprite.once("animationcomplete", () => {
        this.setState(fallbackState);
      });
    }
  }

  syncBattleState(battleState) {
    this.latestBattleState = battleState;
    this.isInCombat = !!battleState;
    this.refreshUI();
  }

  enterBattleStance() {
    this.isInCombat = true;
    this.setState(PLAYER_STATES.SWORDIDLE);
    this.refreshUI();
  }

  exitBattleStance() {
    this.isInCombat = false;
    this.latestBattleState = null;
    this.setState(this.defaultNonCombatState);
    this.refreshUI();
  }

  playAttackAnim() {
    this.playOneShotState(PLAYER_STATES.SWORDSLASH, PLAYER_STATES.SWORDIDLE);
  }

  playGuardAnim() {
    this.playOneShotState(PLAYER_STATES.GUARD, PLAYER_STATES.SWORDIDLE);
  }

  playDamageAnim() {
    this.playOneShotState(PLAYER_STATES.DAMAGE, PLAYER_STATES.SWORDIDLE);
  }

  playDeathAnim() {
    this.setState(PLAYER_STATES.DIE);
  }

  getHealthColor(ratio) {
    if (ratio <= 0.25) return 0xff4d4d;
    if (ratio <= 0.5) return 0xffc857;
    return 0x4caf50;
  }

  showDamageEffect({ hit, damage }) {
    const showMiss = !hit || damage <= 0;
    const textValue = showMiss ? "MISS" : String(damage);

    const worldMatrix = this.sprite.getWorldTransformMatrix();
    const worldX = worldMatrix.tx;
    const worldY = worldMatrix.ty;

    const dmgText = this.scene.add.bitmapText(
      worldX + this.layout.damageTextX,
      worldY + this.layout.damageTextY,
      "font01",
      textValue,
      18
    );

    dmgText.setOrigin(0.5);
    dmgText.setDepth(6001);
    dmgText.setAlpha(1);

    this.scene.time.delayedCall(1000, () => {
      if (!dmgText?.scene) {
        return;
      }

      this.scene.tweens.add({
        targets: dmgText,
        y: dmgText.y - 18,
        alpha: 0,
        duration: 250,
        ease: "Power1",
        onComplete: () => {
          if (dmgText?.scene) {
            dmgText.destroy();
          }
        }
      });
    });
  }

  refreshUI() {
    if (!this.scene.playerState) {
      return;
    }

    const stats = this.scene.playerState.getStats();
    const health = stats.health ?? 0;
    const maxHealth = stats.maxHealth ?? 1;
    const hpRatio = health / Math.max(1, maxHealth);

    this.hpBar.setValue(health, maxHealth, this.getHealthColor(hpRatio));

    const playerGauge = this.latestBattleState?.player?.gauge ?? 0;
    const gaugeRatio = playerGauge / 100;

    this.gaugeBar.setVisible(this.isInCombat);

    if (this.isInCombat) {
      this.gaugeBar.setRatio(gaugeRatio, 0x66ccff);
    }
  }

  show() {
    super.show();
    this.hpBar.setVisible(true);
    this.gaugeBar.setVisible(this.isInCombat);
  }

  hide() {
    this.hpBar.hideTooltip();
    super.hide();
  }

  update() {
    this.refreshUI();
    this.hpBar.updateTooltip();
  }

  destroy() {
    this.hpBar?.destroy();
    this.gaugeBar?.destroy();
    super.destroy();
  }
}