import Phaser from "phaser";

export default class BasePanel {
  constructor(scene, x, y, width, height, config = {}) {
    this.scene = scene;
    this.panelWidth = width;
    this.panelHeight = height;

    this.isOpen = true;
    this.blockInteractionObjects = [];

    this.config = {
      depth: config.depth ?? 5000,
      backgroundColor: config.backgroundColor ?? 0x090a14,
      borderColor: config.borderColor ?? 0x752438,
      borderWidth: config.borderWidth ?? 2,
      alphaWhenHidden: config.alphaWhenHidden ?? 0,
      useCloseButton: config.useCloseButton ?? true,
      closeButtonKey: config.closeButtonKey ?? "close",
      onClose: config.onClose ?? null
    };

    this.container = this.scene.add.container(x, y);
    this.container.setDepth(this.config.depth);

    this.panelBg = this.scene.add.graphics();
    this.drawPanelBackground();
    this.container.add(this.panelBg);

    this.panelBg.setInteractive(
      new Phaser.Geom.Rectangle(
        -this.panelWidth / 2,
        -this.panelHeight / 2,
        this.panelWidth,
        this.panelHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );

    this.closeButton = null;
    this.closeHoverRect = null;

    if (this.config.useCloseButton) {
      this.createCloseButton();
    }
  }

  drawPanelBackground() {
    this.panelBg.clear();
    this.panelBg.fillStyle(this.config.backgroundColor, 1);
    this.panelBg.lineStyle(this.config.borderWidth, this.config.borderColor, 1);
    this.panelBg.fillRect(
      -this.panelWidth / 2,
      -this.panelHeight / 2,
      this.panelWidth,
      this.panelHeight
    );
    this.panelBg.strokeRect(
      -this.panelWidth / 2,
      -this.panelHeight / 2,
      this.panelWidth,
      this.panelHeight
    );
  }

  createCloseButton() {
    const closeX = this.panelWidth / 2 - 23;
    const closeY = -this.panelHeight / 2 + 5;

    this.closeButton = this.scene.add.image(
      closeX,
      closeY,
      this.config.closeButtonKey
    );
    this.closeButton.setOrigin(0, 0);
    this.closeButton.setInteractive();

    this.closeHoverRect = this.scene.add.graphics();
    this.closeHoverRect.lineStyle(1, 0x00ff00, 1);
    this.closeHoverRect.strokeRect(
      this.closeButton.x,
      this.closeButton.y,
      this.closeButton.displayWidth,
      this.closeButton.displayHeight
    );
    this.closeHoverRect.setAlpha(0);

    this.add(this.closeButton);
    this.add(this.closeHoverRect);

    this.addBlockInteractionObject(this.closeButton);

    this.closeButton.on("pointerdown", () => {
      this.handleClose();
    });

    this.closeButton.on("pointerover", () => {
      this.scene.cursorManager?.setState?.("pointer");
      this.closeHoverRect?.setAlpha?.(1);
    });

    this.closeButton.on("pointerout", () => {
      this.scene.cursorManager?.setState?.("default");
      this.closeHoverRect?.setAlpha?.(0);
    });
  }

  handleClose() {
    if (typeof this.config.onClose === "function") {
      this.config.onClose();
      return;
    }

    this.hide();
  }

  add(child) {
    this.container.add(child);
    return child;
  }

  addMany(children = []) {
    this.container.add(children);
    return children;
  }

  addBlockInteractionObject(gameObject) {
    this.blockInteractionObjects.push(gameObject);
    return gameObject;
  }

  isPointerOnBlockedObject(pointer) {
    for (const obj of this.blockInteractionObjects) {
      if (!obj?.getBounds) {
        continue;
      }

      const bounds = obj.getBounds();
      if (bounds.contains(pointer.worldX, pointer.worldY)) {
        return true;
      }
    }

    return false;
  }

  enableBaseInteractivity() {
    this.panelBg.setInteractive(
      new Phaser.Geom.Rectangle(
        -this.panelWidth / 2,
        -this.panelHeight / 2,
        this.panelWidth,
        this.panelHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );

    this.closeButton?.setInteractive?.();
  }

  disableBaseInteractivity() {
    this.panelBg.disableInteractive();
    this.closeButton?.disableInteractive?.();
    this.scene.cursorManager?.setState?.("default");
    this.closeHoverRect?.setAlpha?.(0);
  }

  setPosition(x, y) {
    this.container.setPosition(x, y);
  }

  setDepth(depth) {
    this.container.setDepth(depth);
  }

  show() {
    this.isOpen = true;
    this.container.setAlpha(1);
    this.enableBaseInteractivity();
  }

  hide() {
    this.isOpen = false;
    this.container.setAlpha(this.config.alphaWhenHidden);
    this.disableBaseInteractivity();
  }

  destroy() {
    this.blockInteractionObjects = [];
    this.container.destroy(true);
  }
}