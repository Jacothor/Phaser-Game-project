import { ITEM_DATA } from "../data/itemData.js";
import { createItemStack } from "./items/createItemStack.js";

export default class InventorySystem {
  constructor(playerState) {
    this.playerState = playerState;
  }

  getItems() {
    return this.playerState.inventory;
  }

  getMaxSlots() {
    return this.playerState.maxSlots;
  }

  getUsedSlots() {
    return this.playerState.inventory.length;
  }

  getFreeSlots() {
    return this.getMaxSlots() - this.getUsedSlots();
  }

  isFull() {
    return this.getUsedSlots() >= this.getMaxSlots();
  }

  getItemDef(defId) {
    return ITEM_DATA[defId] ?? null;
  }

  canAddItem(defId, quantity = 1) {
    const itemDef = this.getItemDef(defId);

    if (!itemDef) {
      console.warn(`InventorySystem: unknown item defId "${defId}"`);
      return false;
    }

    if (quantity <= 0) {
      return false;
    }

    if (itemDef.stackable) {
      const existingStack = this.playerState.inventory.find(
        (entry) => entry.defId === defId
      );

      if (existingStack) {
        const spaceLeft = itemDef.maxStack - existingStack.quantity;
        const remainingAfterStack = Math.max(0, quantity - spaceLeft);

        if (remainingAfterStack === 0) {
          return true;
        }

        return this.getFreeSlots() >= 1;
      }

      return this.getFreeSlots() >= 1;
    }

    return this.getFreeSlots() >= quantity;
  }

  addItem(defId, quantity = 1) {
    const itemDef = this.getItemDef(defId);

    if (!itemDef) {
      console.warn(`InventorySystem: unknown item defId "${defId}"`);
      return false;
    }

    if (quantity <= 0) {
      return false;
    }

    if (!this.canAddItem(defId, quantity)) {
      return false;
    }

    if (itemDef.stackable) {
      let remaining = quantity;

      const existingStack = this.playerState.inventory.find(
        (entry) => entry.defId === defId
      );

      if (existingStack) {
        const spaceLeft = itemDef.maxStack - existingStack.quantity;
        const toAdd = Math.min(spaceLeft, remaining);

        existingStack.quantity += toAdd;
        remaining -= toAdd;
      }

      while (remaining > 0) {
        const stackAmount = Math.min(itemDef.maxStack, remaining);
        this.playerState.inventory.push(createItemStack(defId, stackAmount));
        remaining -= stackAmount;
      }

      return true;
    }

    for (let i = 0; i < quantity; i++) {
      this.playerState.inventory.push(createItemStack(defId, 1));
    }

    return true;
  }

  removeItemByUid(uid, quantity = 1) {
    const index = this.playerState.inventory.findIndex((entry) => entry.uid === uid);

    if (index === -1) {
      return false;
    }

    const entry = this.playerState.inventory[index];
    const itemDef = this.getItemDef(entry.defId);

    if (!itemDef) {
      return false;
    }

    if (!itemDef.stackable || entry.quantity <= quantity) {
      this.playerState.inventory.splice(index, 1);
      return true;
    }

    entry.quantity -= quantity;
    return true;
  }

  countItem(defId) {
    return this.playerState.inventory
      .filter((entry) => entry.defId === defId)
      .reduce((sum, entry) => sum + entry.quantity, 0);
  }

  hasItem(defId, quantity = 1) {
    return this.countItem(defId) >= quantity;
  }
}