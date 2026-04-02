import DraggablePanel from "./DraggablePanel.js";
import PanelStatusBar from "./PanelStatusBar.js";
import { ENEMY_DATA } from "../data/enemiesData.js";
import { addText } from "../utils/addText.js";

const TEXT_COLOR = 0xffffff;

export default class BattlePanel extends DraggablePanel {
  constructor(scene, x, y) {
    super(scene, x, y, 260, 260, {
      depth: 5000
    });

    this.scene = scene;

    this.currentEnemyId = null;
    this.latestBattleState = null;

    this.layout = {
      hpBarX: -100,
      hpBarY: 65,
      gaugeBarY: 120,
      barWidth: 200,
      barHeight: 10,
      damageTextX: 0,
      damageTextY: -40
    };

    this.enemySprite = this.scene.add.sprite(0, -25, "gray_wolf", 0);
    this.enemySprite.setOrigin(0.5, 0.5);
    this.enemySprite.setScale(2);

    this.enemyNameText = addText(this.scene, {
      x: 0,
      y: -95,
      text: "",
      size: 20,
      color: TEXT_COLOR,
      originX: 0.5,
      originY: 0.5
    });

    this.enemyHpBar = new PanelStatusBar(this.scene, this, {
      x: this.layout.hpBarX,
      y: this.layout.hpBarY,
      width: this.layout.barWidth,
      height: this.layout.barHeight,
      fillColor: 0x4caf50,
      showTooltip: true,
      tooltipFormatter: (value, max) => `${value} / ${max}`
    });

    this.enemyGaugeBar = new PanelStatusBar(this.scene, this, {
      x: this.layout.hpBarX,
      y: this.layout.gaugeBarY,
      width: this.layout.barWidth,
      height: this.layout.barHeight,
      fillColor: 0x66ccff,
      showTooltip: false
    });

    this.addMany([
      this.enemyNameText,
      this.enemySprite
    ]);

    this.setEnemy("gray_wolf");
    this.refreshBattleUI();
  }

  setEnemy(enemyId) {
    const enemyData = ENEMY_DATA[enemyId];
    if (!enemyData) {
      console.warn(`Enemy not found: ${enemyId}`);
      return;
    }

    this.currentEnemyId = enemyId;
    this.enemySprite.setTexture(enemyData.ID, 0);
    this.playEnemyAnim("idle");
    this.enemyNameText.setText((enemyData.name || enemyData.ID).toUpperCase());
  }

  playEnemyAnim(animKey) {
    if (!this.currentEnemyId) {
      return;
    }

    const fullAnimKey = `${this.currentEnemyId}-${animKey}`;
    this.enemySprite.play(fullAnimKey);

    if (animKey !== "idle") {
      this.enemySprite.once("animationcomplete", () => {
        this.playEnemyAnim("idle");
      });
    }
  }

  syncBattleState(battleState) {
    this.latestBattleState = battleState;
    this.refreshBattleUI();
  }

  getHealthColor(ratio) {
    if (ratio <= 0.25) return 0xff4d4d;
    if (ratio <= 0.5) return 0xffc857;
    return 0x4caf50;
  }

  showDamageEffect({ hit, damage }) {
    const showMiss = !hit || damage <= 0;
    const textValue = showMiss ? "MISS" : String(damage);

    const worldMatrix = this.enemySprite.getWorldTransformMatrix();
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

  refreshBattleUI() {
    const battleState = this.latestBattleState;

    if (!battleState) {
      this.enemyHpBar.setValue(0, 1, 0x4caf50);
      this.enemyGaugeBar.setRatio(0, 0x66ccff);
      return;
    }

    const enemy = battleState.enemy;
    const hp = enemy?.health ?? 0;
    const maxHp = enemy?.maxHealth ?? 1;
    const hpRatio = hp / Math.max(1, maxHp);
    const gaugeRatio = (enemy?.gauge ?? 0) / 100;

    this.enemyHpBar.setValue(hp, maxHp, this.getHealthColor(hpRatio));
    this.enemyGaugeBar.setRatio(gaugeRatio, 0x66ccff);
  }

  show() {
    super.show();
    this.enemyHpBar.setVisible(true);
    this.enemyGaugeBar.setVisible(true);
  }

  hide() {
    this.enemyHpBar.hideTooltip();
    super.hide();
  }

  update() {
    this.refreshBattleUI();
    this.enemyHpBar.updateTooltip();
  }

  destroy() {
    this.enemyHpBar?.destroy();
    this.enemyGaugeBar?.destroy();
    super.destroy();
  }
}