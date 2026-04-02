import DraggablePanel from "./DraggablePanel.js";
import { ITEM_DATA } from "../data/itemData.js";

export default class LootPanel extends DraggablePanel {
  constructor(scene, x, y, lootSystem, inventorySystem, inventoryPanel) {
    super(scene, x, y, 260, 260, {
      depth: 5050
    });

    this.scene = scene;
    this.lootSystem = lootSystem;
    this.inventorySystem = inventorySystem;
    this.inventoryPanel = inventoryPanel;

    this.layout = {
      cols: 4,
      slotSize: 48,
      gap: 8,
      startX: -80,
      startY: -80
    };

    this.itemObjects = [];

    this.title = this.scene.add.bitmapText(0, -110, "font01", "Loot", 16);
    this.title.setOrigin(0.5);

    this.add(this.title);

    this.refresh();
    this.hide();
  }

  clear() {
    this.itemObjects.forEach((o) => o.destroy());
    this.itemObjects = [];
  }

  refresh() {
    this.clear();

    const items = this.lootSystem.getLoot();

    items.forEach((entry, index) => {
      const def = ITEM_DATA[entry.defId];
      if (!def) {
        return;
      }

      const col = index % this.layout.cols;
      const row = Math.floor(index / this.layout.cols);

      const x = this.layout.startX + col * (this.layout.slotSize + this.layout.gap);
      const y = this.layout.startY + row * (this.layout.slotSize + this.layout.gap);

      const icon = this.scene.add.sprite(
        x + this.layout.slotSize / 2,
        y + this.layout.slotSize / 2,
        def.iconSheet,
        def.frame
      );

      icon.setInteractive();

      icon.on("pointerover", () => {
        this.scene.cursorManager?.setState?.("pointer");
      });

      icon.on("pointerout", () => {
        this.scene.cursorManager?.setState?.("default");
      });

      icon.on("pointerdown", () => {
        this.handleTake(entry);
      });

      this.add(icon);
      this.addBlockInteractionObject(icon);
      this.itemObjects.push(icon);

      if (def.stackable && entry.quantity > 1) {
        const txt = this.scene.add.bitmapText(
          x + this.layout.slotSize - 6,
          y + this.layout.slotSize - 6,
          "font01",
          String(entry.quantity),
          12
        );
        txt.setOrigin(1, 1);

        this.add(txt);
        this.itemObjects.push(txt);
      }
    });
  }

  handleTake(entry) {
    const success = this.inventorySystem.addItem(entry.defId, 1);
    if (!success) {
      return;
    }

    this.lootSystem.removeItem(entry.uid, 1);
    this.inventoryPanel?.refresh?.();

    if (this.lootSystem.isEmpty()) {
      this.hide();
      return;
    }

    this.refresh();
  }

  show() {
    super.show();
    this.refresh();
  }
}