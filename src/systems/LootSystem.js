import { createItemStack } from "./items/createItemStack.js";

export default class LootSystem {
  constructor() {
    this.currentLoot = [];
  }

  getLoot() {
    return this.currentLoot;
  }

  clearLoot() {
    this.currentLoot = [];
  }

  generateLootFromEnemy(enemyId) {
    const newLoot = [
      createItemStack("wolf_pelt", 1),
      createItemStack("blue_berries", 2)
    ];

    this.currentLoot.push(...newLoot);
  }

  removeItem(uid, quantity = 1) {
    const index = this.currentLoot.findIndex(i => i.uid === uid);
    if (index === -1) return false;

    const entry = this.currentLoot[index];

    if (entry.quantity <= quantity) {
      this.currentLoot.splice(index, 1);
    } else {
      entry.quantity -= quantity;
    }

    return true;
  }

  isEmpty() {
    return this.currentLoot.length === 0;
  }
}