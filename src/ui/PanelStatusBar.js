import Phaser from "phaser";

export default class PanelStatusBar {
  constructor(scene, panel, config = {}) {
    this.scene = scene;
    this.panel = panel;

    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.width = config.width ?? 100;
    this.height = config.height ?? 10;

    this.fillColor = config.fillColor ?? 0x4caf50;
    this.bgColor = config.bgColor ?? 0x222222;
    this.borderColor = config.borderColor ?? 0xffffff;

    this.showTooltip = config.showTooltip ?? false;
    this.tooltipOffsetX = config.tooltipOffsetX ?? 8;
    this.tooltipOffsetY = config.tooltipOffsetY ?? -22;
    this.tooltipFormatter =
      config.tooltipFormatter ?? ((value, max) => `${value} / ${max}`);

    this.currentValue = 0;
    this.maxValue = 1;
    this.isHovering = false;
    this.visible = true;

    this.bg = this.scene.add.graphics();
    this.fill = this.scene.add.graphics();

    this.hitArea = this.scene.add.zone(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width,
      this.height
    );
    this.hitArea.setOrigin(0.5, 0.5);

    this.tooltipBg = null;
    this.tooltipText = null;

    if (this.showTooltip) {
      this.hitArea.setInteractive({ useHandCursor: false });

      this.tooltipBg = this.scene.add.graphics();
      this.tooltipText = this.scene.add.text(0, 0, "0 / 0", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#ffffff"
      });

      this.tooltipBg.setVisible(false);
      this.tooltipText.setVisible(false);
      this.tooltipBg.setDepth(5001);
      this.tooltipText.setDepth(5002);

      this.hitArea.on("pointerover", () => {
        this.isHovering = true;
        this.tooltipBg.setVisible(true);
        this.tooltipText.setVisible(true);
      });

      this.hitArea.on("pointerout", () => {
        this.isHovering = false;
        this.tooltipBg.setVisible(false);
        this.tooltipText.setVisible(false);
      });

      this.panel.addBlockInteractionObject(this.hitArea);
    }

    this.panel.add(this.bg);
    this.panel.add(this.fill);
    this.panel.add(this.hitArea);

    this.draw();
  }

  setValue(value = 0, max = 1, fillColor = null) {
    this.currentValue = Math.max(0, value ?? 0);
    this.maxValue = Math.max(1, max ?? 1);

    if (fillColor !== null) {
      this.fillColor = fillColor;
    }

    this.draw();
    this.updateTooltipText();
  }

  setRatio(ratio = 0, fillColor = null) {
    const clamped = Phaser.Math.Clamp(ratio, 0, 1);
    this.currentValue = clamped;
    this.maxValue = 1;

    if (fillColor !== null) {
      this.fillColor = fillColor;
    }

    this.draw(clamped);
    this.updateTooltipText();
  }

  setVisible(value) {
    this.visible = !!value;

    this.bg.setVisible(this.visible);
    this.fill.setVisible(this.visible);
    this.hitArea.setVisible(this.visible);

    if (!this.visible) {
      this.hitArea.disableInteractive?.();
      this.hideTooltip();
      return;
    }

    if (this.showTooltip) {
      this.hitArea.setInteractive({ useHandCursor: false });
    }
  }

  draw(forcedRatio = null) {
    const ratio =
      forcedRatio ?? Phaser.Math.Clamp(this.currentValue / this.maxValue, 0, 1);

    this.bg.clear();
    this.bg.fillStyle(this.bgColor, 1);
    this.bg.lineStyle(1, this.borderColor, 1);
    this.bg.fillRect(this.x, this.y, this.width, this.height);
    this.bg.strokeRect(this.x, this.y, this.width, this.height);

    this.fill.clear();
    this.fill.fillStyle(this.fillColor, 1);
    this.fill.fillRect(this.x, this.y, this.width * ratio, this.height);

    this.hitArea.setPosition(
      this.x + this.width / 2,
      this.y + this.height / 2
    );
    this.hitArea.setSize(this.width, this.height);
  }

  updateTooltipText() {
    if (!this.tooltipText) {
      return;
    }

    this.tooltipText.setText(
      this.tooltipFormatter(this.currentValue, this.maxValue)
    );
  }

  updateTooltip() {
    if (!this.showTooltip || !this.isHovering || !this.tooltipText) {
      return;
    }

    const pointer = this.scene.input.activePointer;
    if (!pointer) {
      return;
    }

    const textX = pointer.worldX + this.tooltipOffsetX;
    const textY = pointer.worldY + this.tooltipOffsetY;

    this.tooltipText.setPosition(textX, textY);

    const bounds = this.tooltipText.getBounds();
    const padX = 4;
    const padY = 2;

    this.tooltipBg.clear();
    this.tooltipBg.fillStyle(0x000000, 0.9);
    this.tooltipBg.lineStyle(1, 0xffffff, 1);
    this.tooltipBg.fillRect(
      bounds.x - padX,
      bounds.y - padY,
      bounds.width + padX * 2,
      bounds.height + padY * 2
    );
    this.tooltipBg.strokeRect(
      bounds.x - padX,
      bounds.y - padY,
      bounds.width + padX * 2,
      bounds.height + padY * 2
    );
  }

  hideTooltip() {
    this.isHovering = false;
    this.tooltipBg?.setVisible(false);
    this.tooltipText?.setVisible(false);
  }

  destroy() {
    this.hideTooltip();
    this.tooltipBg?.destroy();
    this.tooltipText?.destroy();
    this.bg?.destroy();
    this.fill?.destroy();
    this.hitArea?.destroy();
  }
}