import DraggablePanel from "./DraggablePanel.js";
import { ITEM_DATA } from "../data/itemData.js";
import ItemActionMenu from "./ItemActionMenu.js";

export default class InventoryPanel extends DraggablePanel {
  constructor(scene, x, y, inventorySystem) {
    super(scene, x, y, 320, 320, {
      depth: 5100
    });

    this.scene = scene;
    this.inventorySystem = inventorySystem;

    this.itemActionMenu = new ItemActionMenu(this.scene, {
      onUse: (entry) => this.handleUse(entry),
      onDrop: (entry) => this.handleDrop(entry),
      onObserve: (entry) => this.handleObserve(entry),
      onEat: (entry) => this.handleEat(entry),
      onEquip: (entry) => this.handleEquip(entry)
    });

    this.layout = {
      cols: 5,
      rows: 4,
      slotSize: 48,
      slotGap: 8,
      startX: -132,
      startY: -92,
      quantityOffsetX: 5,
      quantityOffsetY: 5
    };

    this.slotObjects = [];
    this.itemObjects = [];

    this.titleText = this.scene.add.bitmapText(
      0,
      -130,
      "font01",
      "Inventory",
      20
    );
    this.titleText.setOrigin(0.5);

    this.add(this.titleText);

    this.createSlots();
    this.refresh();
  }

  createSlots() {
    const { cols, rows, slotSize, slotGap, startX, startY } = this.layout;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (slotSize + slotGap);
        const y = startY + row * (slotSize + slotGap);

        const bg = this.scene.add.rectangle(x, y, slotSize, slotSize, 0x111111);
        bg.setOrigin(0, 0);
        bg.setStrokeStyle(1, 0x752438);

        this.slotObjects.push(bg);
        this.add(bg);
      }
    }
  }

  clearItemObjects() {
    this.itemObjects.forEach((obj) => obj.destroy());
    this.itemObjects = [];
  }

  refresh() {
    this.clearItemObjects();

    const items = this.inventorySystem.getItems();
    const {
      cols,
      slotSize,
      slotGap,
      startX,
      startY,
      quantityOffsetX,
      quantityOffsetY
    } = this.layout;

    items.forEach((entry, index) => {
      const itemDef = ITEM_DATA[entry.defId];
      if (!itemDef) {
        return;
      }

      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = startX + col * (slotSize + slotGap);
      const y = startY + row * (slotSize + slotGap);

      const icon = this.scene.add.sprite(
        x + slotSize / 2,
        y + slotSize / 2,
        itemDef.iconSheet,
        itemDef.frame
      );

      icon.setInteractive();

      icon.on("pointerdown", (pointer) => {
        if (pointer.leftButtonDown()) {
          this.handleItemClick(entry);
          return;
        }

        if (pointer.rightButtonDown()) {
          this.itemActionMenu.show(entry, pointer.worldX, pointer.worldY);
        }
      });

      icon.on("pointerover", () => {
        this.scene.cursorManager?.setState?.("pointer");
      });

      icon.on("pointerout", () => {
        this.scene.cursorManager?.setState?.("default");
      });

      this.addBlockInteractionObject(icon);
      this.add(icon);
      this.itemObjects.push(icon);

      if (itemDef.stackable && entry.quantity > 1) {
        const qtyText = this.scene.add.bitmapText(
          x + slotSize - quantityOffsetX,
          y + slotSize - quantityOffsetY,
          "font01",
          String(entry.quantity),
          14
        );
        qtyText.setOrigin(1, 1);

        this.add(qtyText);
        this.itemObjects.push(qtyText);
      }
    });
  }

  handleItemClick(entry) {
    const itemDef = ITEM_DATA[entry.defId];
    if (!itemDef) {
      return;
    }

    if (itemDef.type === "food") {
      this.scene.playerState.heal(1);
      this.inventorySystem.removeItemByUid(entry.uid, 1);
      this.refresh();
    }
  }

  handleUse(entry) {
    if (!entry) {
      return;
    }

    const itemDef = ITEM_DATA[entry.defId];
    if (!itemDef) {
      return;
    }

    console.log("Use:", itemDef.name);
  }

  handleDrop(entry) {
    if (!entry) {
      return;
    }

    this.inventorySystem.removeItemByUid(entry.uid, 1);
    this.refresh();
  }

  handleObserve(entry) {
    if (!entry) {
      return;
    }

    const itemDef = ITEM_DATA[entry.defId];
    if (!itemDef) {
      return;
    }

    console.log("Observe:", itemDef);
  }

  handleEat(entry) {
    if (!entry) {
      return;
    }

    const itemDef = ITEM_DATA[entry.defId];
    if (!itemDef || itemDef.type !== "food") {
      return;
    }

    this.scene.playerState.heal(1);
    this.inventorySystem.removeItemByUid(entry.uid, 1);
    this.refresh();
  }

  handleEquip(entry) {
    if (!entry) {
      return;
    }

    const itemDef = ITEM_DATA[entry.defId];
    if (!itemDef) {
      return;
    }

    console.log("Equip:", itemDef.name);
  }

  show() {
    super.show();
    this.refresh();
  }

  hide() {
    this.itemActionMenu?.hide?.();
    super.hide();
  }

  destroy() {
    this.itemActionMenu?.destroy?.();
    super.destroy();
  }
}