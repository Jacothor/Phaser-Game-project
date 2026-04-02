import { getEquipmentBaseDef } from "../../data/equipmentData.js";

let nextAssembledUid = 1;

function createEmptySocketLoad(slotIds = []) {
  const load = {};

  for (const slotId of slotIds) {
    load[slotId] = null;
  }

  return load;
}

export function createAssembledEquipmentInstance({
  baseEquipmentDefId,
  casingInstance
}) {
  const baseDef = getEquipmentBaseDef(baseEquipmentDefId);

  if (!baseDef) {
    throw new Error(`Unknown equipment base def: ${baseEquipmentDefId}`);
  }

  if (!baseDef.canAssembleCasing) {
    throw new Error(`Equipment cannot assemble casing: ${baseEquipmentDefId}`);
  }

  if (!casingInstance) {
    throw new Error("Missing casingInstance");
  }

  if (baseDef.casingType !== casingInstance.casingType) {
    throw new Error(
      `Casing type mismatch: expected ${baseDef.casingType}, got ${casingInstance.casingType}`
    );
  }

  return {
    uid: `assembled_${nextAssembledUid++}`,
    type: "assembled_equipment",
    slot: baseDef.slot,
    category: baseDef.category,

    baseEquipmentDefId,
    casing: {
      ...casingInstance
    },

    socketLoad: createEmptySocketLoad(casingInstance.slotIds),

    assemblyLocked: true,
    enchantData: {
      level: 0,
      modifiers: []
    }
  };
}