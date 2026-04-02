import BaseSystem from "../ui/BaseSystem.js";
import { getEquipmentBaseDef } from "../data/equipmentData.js";
import { createAssembledEquipmentInstance } from "./items/createAssembledEquipmentInstance.js";
import { removeVitaCharges, addVitaCharges } from "./vita/createVitaLedger.js";
import { createSocketLoadEntry } from "./vita/socketLoadHelpers.js";

export default class EquipmentSystem extends BaseSystem {
  constructor(scene, config = {}) {
    super(scene, config);

    this.playerState = config.playerState ?? null;
    this.bonusSystem = config.bonusSystem ?? null;
  }

  assembleEquipment(baseEquipmentDefId, casingInstance) {
    const baseDef = getEquipmentBaseDef(baseEquipmentDefId);
    if (!baseDef) return null;

    return createAssembledEquipmentInstance({
      baseEquipmentDefId,
      casingInstance
    });
  }

  equipItem(slotId, itemInstance) {
    if (!this.playerState || !itemInstance) {
      return false;
    }

    this.playerState.equipItem(slotId, itemInstance);
    this.bonusSystem?.markDirty?.();

    this.emit("equipment.changed", {
      slotId,
      reason: "equipped"
    });

    return true;
  }

  unequipItem(slotId) {
    if (!this.playerState) {
      return null;
    }

    const removed = this.playerState.unequipItem(slotId);
    this.bonusSystem?.markDirty?.();

    this.emit("equipment.changed", {
      slotId,
      reason: "unequipped"
    });

    return removed;
  }

  loadVitaIntoSocket(slotId, socketId, enemyType, tier, charges) {
    if (!this.playerState) {
      return false;
    }

    const item = this.playerState.getEquippedItem(slotId);
    if (!item?.casing || !item?.socketLoad) {
      return false;
    }

    if (!item.casing.slotIds.includes(socketId)) {
      return false;
    }

    if (item.socketLoad[socketId]) {
      return false;
    }

    const removed = removeVitaCharges(
      this.playerState.getVitaLedger(),
      enemyType,
      tier,
      charges
    );

    if (!removed) {
      return false;
    }

    item.socketLoad[socketId] = createSocketLoadEntry({
      enemyType,
      tier,
      charges
    });

    this.bonusSystem?.markDirty?.();

    this.emit("equipment.socket_changed", {
      slotId,
      socketId,
      reason: "vita_loaded"
    });

    return true;
  }

  unloadVitaFromSocket(slotId, socketId) {
    if (!this.playerState) {
      return false;
    }

    const item = this.playerState.getEquippedItem(slotId);
    if (!item?.socketLoad?.[socketId]) {
      return false;
    }

    const socketEntry = item.socketLoad[socketId];

    addVitaCharges(
      this.playerState.getVitaLedger(),
      socketEntry.enemyType,
      socketEntry.tier,
      socketEntry.charges
    );

    item.socketLoad[socketId] = null;

    this.bonusSystem?.markDirty?.();

    this.emit("equipment.socket_changed", {
      slotId,
      socketId,
      reason: "vita_unloaded"
    });

    return true;
  }
}