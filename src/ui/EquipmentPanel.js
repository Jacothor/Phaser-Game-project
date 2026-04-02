import Phaser from "phaser";
import DraggablePanel from "./DraggablePanel.js";
import { addText } from "../utils/addText.js";
import { getEquipmentBaseDef } from "../data/equipmentData.js";
import { getVitaDef } from "../data/vitaData.js";

const TEXT_COLOR = 0xffffff;
const MUTED_TEXT_COLOR = 0xb8b8b8;
const OK_TEXT_COLOR = 0x7cff7c;
const BORDER_COLOR = 0x752438;
const WARNING_COLOR = 0xffc857;

export default class EquipmentPanel extends DraggablePanel {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 500, 380, {
      depth: 5350
    });

    this.scene = scene;
    this.playerState = config.playerState ?? null;
    this.equipmentSystem = config.equipmentSystem ?? null;
    this.vitaPanel = config.vitaPanel ?? null;

    this.selectedSlotId = "sword";
    this.selectedSocketId = null;

    this.slotRowObjects = [];
    this.detailObjects = [];
    this.socketObjects = [];

    this.layout = {
      titleY: -165,

      slotListX: -230,
      slotListY: -120,
      slotListWidth: 150,
      slotRowHeight: 42,

      detailsX: -55,
      detailsY: -120,
      detailsWidth: 255,
      detailsHeight: 190,

      socketsX: -55,
      socketsY: 80,
      socketSize: 28,
      socketGap: 8,
      socketsPerRow: 5,

      loadButtonX: 110,
      loadButtonY: 78,
      buttonWidth: 90,
      buttonHeight: 28,

      unloadButtonX: 110,
      unloadButtonY: 112
    };

    this.titleText = addText(this.scene, {
      x: 0,
      y: this.layout.titleY,
      text: "Equipment",
      size: 20,
      color: TEXT_COLOR,
      originX: 0.5,
      originY: 0.5
    });

    this.slotListBg = this.scene.add.rectangle(
      this.layout.slotListX,
      this.layout.slotListY,
      this.layout.slotListWidth,
      225,
      0x111111
    );
    this.slotListBg.setOrigin(0, 0);
    this.slotListBg.setStrokeStyle(1, BORDER_COLOR);

    this.detailsBg = this.scene.add.rectangle(
      this.layout.detailsX,
      this.layout.detailsY,
      this.layout.detailsWidth,
      this.layout.detailsHeight,
      0x111111
    );
    this.detailsBg.setOrigin(0, 0);
    this.detailsBg.setStrokeStyle(1, BORDER_COLOR);

    this.loadButton = this.createButton(
      this.layout.loadButtonX,
      this.layout.loadButtonY,
      "Load 1",
      () => this.loadSelectedVitaToSocket()
    );

    this.unloadButton = this.createButton(
      this.layout.unloadButtonX,
      this.layout.unloadButtonY,
      "Unload",
      () => this.unloadSelectedSocket()
    );

    this.addMany([
      this.titleText,
      this.slotListBg,
      this.detailsBg
    ]);

    this.refresh();
    this.hide();
  }

  createButton(x, y, label, onClick) {
    const bg = this.scene.add.rectangle(
      x,
      y,
      this.layout.buttonWidth,
      this.layout.buttonHeight,
      0x000000
    );
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(1, BORDER_COLOR);
    bg.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, this.layout.buttonWidth, this.layout.buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );

    const text = addText(this.scene, {
      x: x + this.layout.buttonWidth / 2,
      y: y + this.layout.buttonHeight / 2,
      text: label,
      size: 13,
      color: TEXT_COLOR,
      originX: 0.5,
      originY: 0.5
    });

    bg.on("pointerdown", () => {
      onClick?.();
    });

    bg.on("pointerover", () => {
      this.scene.cursorManager?.setState?.("pointer");
    });

    bg.on("pointerout", () => {
      this.scene.cursorManager?.setState?.("default");
    });

    this.add(bg);
    this.add(text);
    this.addBlockInteractionObject(bg);

    return { bg, text };
  }

  getSlotIds() {
    return ["sword", "armor", "accessory1", "accessory2"];
  }

  getItemInSelectedSlot() {
    return this.playerState?.getEquippedItem?.(this.selectedSlotId) ?? null;
  }

  refresh() {
    this.refreshSlotList();
    this.refreshDetails();
    this.refreshSockets();
    this.refreshButtons();
  }

  clearSlotRows() {
    this.slotRowObjects.forEach((obj) => obj.destroy());
    this.slotRowObjects = [];
  }

  refreshSlotList() {
    this.clearSlotRows();

    const slotIds = this.getSlotIds();

    slotIds.forEach((slotId, index) => {
      const item = this.playerState?.getEquippedItem?.(slotId) ?? null;
      const baseDef = item ? getEquipmentBaseDef(item.baseEquipmentDefId) : null;
      const selected = slotId === this.selectedSlotId;

      const y = this.layout.slotListY + 6 + index * this.layout.slotRowHeight;

      const rowBg = this.scene.add.rectangle(
        this.layout.slotListX + 4,
        y,
        this.layout.slotListWidth - 8,
        this.layout.slotRowHeight - 4,
        selected ? 0x2a1a1a : 0x000000
      );
      rowBg.setOrigin(0, 0);
      rowBg.setStrokeStyle(1, selected ? 0xffd166 : BORDER_COLOR);
      rowBg.setInteractive();

      const slotText = addText(this.scene, {
        x: this.layout.slotListX + 10,
        y: y + 6,
        text: this.formatSlotLabel(slotId),
        size: 12,
        color: TEXT_COLOR,
        originX: 0,
        originY: 0
      });

      const itemText = addText(this.scene, {
        x: this.layout.slotListX + 10,
        y: y + 22,
        text: baseDef?.name ?? "Empty",
        size: 11,
        color: baseDef ? OK_TEXT_COLOR : MUTED_TEXT_COLOR,
        originX: 0,
        originY: 0
      });

      rowBg.on("pointerdown", () => {
        this.selectedSlotId = slotId;
        this.selectedSocketId = null;
        this.refresh();
      });

      rowBg.on("pointerover", () => {
        this.scene.cursorManager?.setState?.("pointer");
      });

      rowBg.on("pointerout", () => {
        this.scene.cursorManager?.setState?.("default");
      });

      this.add(rowBg);
      this.add(slotText);
      this.add(itemText);
      this.addBlockInteractionObject(rowBg);

      this.slotRowObjects.push(rowBg, slotText, itemText);
    });
  }

  clearDetails() {
    this.detailObjects.forEach((obj) => obj.destroy());
    this.detailObjects = [];
  }

  refreshDetails() {
    this.clearDetails();

    const item = this.getItemInSelectedSlot();
    const baseDef = item ? getEquipmentBaseDef(item.baseEquipmentDefId) : null;

    let y = this.layout.detailsY + 8;

    const slotTitle = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: this.formatSlotLabel(this.selectedSlotId),
      size: 14,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(slotTitle);
    this.detailObjects.push(slotTitle);

    y += 22;

    if (!item || !baseDef) {
      const emptyText = addText(this.scene, {
        x: this.layout.detailsX + 8,
        y,
        text: "No equipment equipped.",
        size: 12,
        color: MUTED_TEXT_COLOR,
        originX: 0,
        originY: 0
      });
      this.add(emptyText);
      this.detailObjects.push(emptyText);
      return;
    }

    const nameText = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: baseDef.name,
      size: 13,
      color: OK_TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(nameText);
    this.detailObjects.push(nameText);

    y += 18;

    const metalText = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: `Metal: ${baseDef.metalTier}`,
      size: 11,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(metalText);
    this.detailObjects.push(metalText);

    y += 18;

    const casingText = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: `Casing: ${item.casing?.woodTier ?? "None"}`,
      size: 11,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(casingText);
    this.detailObjects.push(casingText);

    y += 18;

    const slotsText = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: `Slots: ${item.casing?.slotCount ?? 0}`,
      size: 11,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(slotsText);
    this.detailObjects.push(slotsText);

    y += 18;

    const linksText = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: `Links: ${item.casing?.links?.length ?? 0}`,
      size: 11,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(linksText);
    this.detailObjects.push(linksText);

    y += 22;

    const statsLabel = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: "Base stats",
      size: 12,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(statsLabel);
    this.detailObjects.push(statsLabel);

    y += 18;

    const stats = baseDef.baseStats ?? {};
    Object.entries(stats).forEach(([statId, value]) => {
      const line = addText(this.scene, {
        x: this.layout.detailsX + 8,
        y,
        text: `${statId}: ${value}`,
        size: 11,
        color: TEXT_COLOR,
        originX: 0,
        originY: 0
      });
      this.add(line);
      this.detailObjects.push(line);
      y += 15;
    });

    if (this.selectedSocketId) {
      y += 8;

      const selectedSocket = item.socketLoad?.[this.selectedSocketId] ?? null;
      const selectedLabel = addText(this.scene, {
        x: this.layout.detailsX + 8,
        y,
        text: `Selected socket: ${this.selectedSocketId}`,
        size: 11,
        color: WARNING_COLOR,
        originX: 0,
        originY: 0
      });
      this.add(selectedLabel);
      this.detailObjects.push(selectedLabel);

      y += 16;

      const socketText = addText(this.scene, {
        x: this.layout.detailsX + 8,
        y,
        text: selectedSocket
          ? `${getVitaDef(selectedSocket.enemyType)?.displayName ?? selectedSocket.enemyType} T${selectedSocket.tier} (${selectedSocket.charges})`
          : "Empty socket",
        size: 11,
        color: selectedSocket ? OK_TEXT_COLOR : MUTED_TEXT_COLOR,
        originX: 0,
        originY: 0
      });
      this.add(socketText);
      this.detailObjects.push(socketText);
    }
  }

  clearSockets() {
    this.socketObjects.forEach((obj) => obj.destroy());
    this.socketObjects = [];
  }

  refreshSockets() {
    this.clearSockets();

    const item = this.getItemInSelectedSlot();
    if (!item?.casing?.slotIds?.length) {
      return;
    }

    item.casing.slotIds.forEach((socketId, index) => {
      const row = Math.floor(index / this.layout.socketsPerRow);
      const col = index % this.layout.socketsPerRow;

      const x =
        this.layout.socketsX +
        col * (this.layout.socketSize + this.layout.socketGap);

      const y =
        this.layout.socketsY +
        row * (this.layout.socketSize + this.layout.socketGap);

      const socketEntry = item.socketLoad?.[socketId] ?? null;
      const selected = socketId === this.selectedSocketId;

      const bg = this.scene.add.rectangle(
        x,
        y,
        this.layout.socketSize,
        this.layout.socketSize,
        socketEntry ? 0x1f3b1f : 0x000000
      );
      bg.setOrigin(0, 0);
      bg.setStrokeStyle(1, selected ? 0xffd166 : BORDER_COLOR);
      bg.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, this.layout.socketSize, this.layout.socketSize),
        Phaser.Geom.Rectangle.Contains
      );

      const label = addText(this.scene, {
        x: x + this.layout.socketSize / 2,
        y: y + this.layout.socketSize / 2,
        text: socketEntry ? String(socketEntry.charges) : "",
        size: 10,
        color: TEXT_COLOR,
        originX: 0.5,
        originY: 0.5
      });

      bg.on("pointerdown", () => {
        this.selectedSocketId = socketId;
        this.refresh();
      });

      bg.on("pointerover", () => {
        this.scene.cursorManager?.setState?.("pointer");
      });

      bg.on("pointerout", () => {
        this.scene.cursorManager?.setState?.("default");
      });

      this.add(bg);
      this.add(label);
      this.addBlockInteractionObject(bg);

      this.socketObjects.push(bg, label);
    });
  }

  refreshButtons() {
    const item = this.getItemInSelectedSlot();
    const hasSocket = !!this.selectedSocketId;
    const socketEntry = hasSocket ? item?.socketLoad?.[this.selectedSocketId] : null;
    const selectedVita = this.vitaPanel?.getSelectedEntry?.() ?? null;

    const canLoad =
      !!item &&
      !!hasSocket &&
      !socketEntry &&
      !!selectedVita &&
      selectedVita.charges > 0;

    const canUnload =
      !!item &&
      !!hasSocket &&
      !!socketEntry;

    this.setButtonEnabled(this.loadButton, canLoad);
    this.setButtonEnabled(this.unloadButton, canUnload);
  }

  setButtonEnabled(buttonObj, enabled) {
    if (!buttonObj) {
      return;
    }

    buttonObj.bg.setFillStyle(enabled ? 0x000000 : 0x222222);
    buttonObj.text.setTint(enabled ? TEXT_COLOR : MUTED_TEXT_COLOR);

    if (enabled) {
      buttonObj.bg.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, this.layout.buttonWidth, this.layout.buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );
    } else {
      buttonObj.bg.disableInteractive();
    }
  }

  loadSelectedVitaToSocket() {
    const item = this.getItemInSelectedSlot();
    const selectedVita = this.vitaPanel?.getSelectedEntry?.() ?? null;

    if (!item || !this.selectedSocketId || !selectedVita || !this.equipmentSystem) {
      return;
    }

    const result = this.equipmentSystem.loadVitaIntoSocket(
      this.selectedSlotId,
      this.selectedSocketId,
      selectedVita.enemyType,
      selectedVita.tier,
      1
    );

    if (!result) {
      return;
    }

    this.refresh();
    this.vitaPanel?.refresh?.();
  }

  unloadSelectedSocket() {
    const item = this.getItemInSelectedSlot();
    if (!item || !this.selectedSocketId || !this.equipmentSystem) {
      return;
    }

    const result = this.equipmentSystem.unloadVitaFromSocket(
      this.selectedSlotId,
      this.selectedSocketId
    );

    if (!result) {
      return;
    }

    this.refresh();
    this.vitaPanel?.refresh?.();
  }

  formatSlotLabel(slotId) {
    switch (slotId) {
      case "sword":
        return "Sword";
      case "armor":
        return "Armor";
      case "accessory1":
        return "Accessory 1";
      case "accessory2":
        return "Accessory 2";
      default:
        return slotId;
    }
  }
}