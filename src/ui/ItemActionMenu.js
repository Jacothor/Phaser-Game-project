import Phaser from "phaser";
import { ITEM_DATA } from "../data/itemData.js";

export default class ItemActionMenu {
  constructor(scene, actions = {}) {
    this.scene = scene;
    this.actions = actions;

    this.layout = {
      depth: 6000,
      padding: 6,
      rowHeight: 20,
      width: 140,
      fontSize: 14,
      bgColor: 0x000000,
      bgAlpha: 0.95,
      borderColor: 0xffffff,
      borderWidth: 1,
      hoverTint: 0xaaaaaa,
      separatorInset: 6
    };

    this.width = 0;
    this.height = 0;
    this.currentEntry = null;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(this.layout.depth);
    this.container.setVisible(false);

    this.bg = this.scene.add.graphics();
    this.container.add(this.bg);

    this.elements = [];

    this.onScenePointerDown = this.onScenePointerDown.bind(this);
    this.scene.input.on("pointerdown", this.onScenePointerDown);
  }

  onScenePointerDown(pointer) {
    if (!this.container.visible) {
      return;
    }

    const x = this.container.x;
    const y = this.container.y;

    if (
      pointer.worldX < x ||
      pointer.worldX > x + this.width ||
      pointer.worldY < y ||
      pointer.worldY > y + this.height
    ) {
      this.hide();
    }
  }

  show(entry, x, y) {
    this.clear();
    this.currentEntry = entry;

    const itemDef = ITEM_DATA[entry.defId];
    if (!itemDef) {
      return;
    }

    const actions = this.buildActions(itemDef);
    let currentY = this.layout.padding;

    const title = this.scene.add.bitmapText(
      this.layout.padding,
      currentY,
      "font01",
      itemDef.name,
      this.layout.fontSize
    );

    this.container.add(title);
    this.elements.push(title);

    currentY += this.layout.rowHeight;

    const line = this.scene.add.graphics();
    line.lineStyle(this.layout.borderWidth, this.layout.borderColor, 1);
    line.lineBetween(
      this.layout.padding,
      currentY - this.layout.separatorInset,
      this.layout.width - this.layout.padding,
      currentY - this.layout.separatorInset
    );

    this.container.add(line);
    this.elements.push(line);

    actions.forEach((action) => {
      const row = this.scene.add.bitmapText(
        this.layout.padding,
        currentY,
        "font01",
        action.label,
        this.layout.fontSize
      );

      row.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, this.layout.width, this.layout.rowHeight),
        Phaser.Geom.Rectangle.Contains
      );

      row.on("pointerover", () => {
        row.setTint(this.layout.hoverTint);
        this.scene.cursorManager?.setState?.("pointer");
      });

      row.on("pointerout", () => {
        row.clearTint();
        this.scene.cursorManager?.setState?.("default");
      });

      row.on("pointerdown", (pointer) => {
        pointer.event.stopPropagation();
        action.onClick();
        this.hide();
      });

      this.container.add(row);
      this.elements.push(row);

      currentY += this.layout.rowHeight;
    });

    const height = currentY + this.layout.padding;
    this.drawBackground(this.layout.width, height);

    this.container.setPosition(x, y);
    this.container.setVisible(true);
  }

  buildActions(itemDef) {
    const actions = [
      { label: "Use", onClick: () => this.onUse() },
      { label: "Drop", onClick: () => this.onDrop() },
      { label: "Observe", onClick: () => this.onObserve() }
    ];

    if (itemDef.type === "food") {
      actions.unshift({ label: "Eat", onClick: () => this.onEat() });
    }

    if (itemDef.type === "equipment") {
      actions.unshift({ label: "Equip", onClick: () => this.onEquip() });
    }

    return actions;
  }

  drawBackground(width, height) {
    this.width = width;
    this.height = height;

    this.bg.clear();
    this.bg.fillStyle(this.layout.bgColor, this.layout.bgAlpha);
    this.bg.lineStyle(this.layout.borderWidth, this.layout.borderColor, 1);
    this.bg.fillRect(0, 0, width, height);
    this.bg.strokeRect(0, 0, width, height);
  }

  clear() {
    this.elements.forEach((el) => el.destroy());
    this.elements = [];
    this.bg.clear();
  }

  hide() {
    this.container.setVisible(false);
    this.currentEntry = null;
    this.clear();
  }

  onUse() {
    this.actions.onUse?.(this.currentEntry);
  }

  onDrop() {
    this.actions.onDrop?.(this.currentEntry);
  }

  onObserve() {
    this.actions.onObserve?.(this.currentEntry);
  }

  onEat() {
    this.actions.onEat?.(this.currentEntry);
  }

  onEquip() {
    this.actions.onEquip?.(this.currentEntry);
  }

  destroy() {
    this.scene.input.off("pointerdown", this.onScenePointerDown);
    this.clear();
    this.container.destroy(true);
  }
}