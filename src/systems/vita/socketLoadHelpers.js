export function createSocketLoadEntry({
  enemyType,
  tier,
  charges
}) {
  return {
    enemyType,
    tier,
    charges
  };
}

export function isSocketFilled(socketEntry) {
  return !!socketEntry;
}

export function getFilledSocketCount(socketLoad = {}) {
  return Object.values(socketLoad).filter(Boolean).length;
}

export function getConnectedSlotIds(casing, slotId) {
  if (!casing?.links) {
    return [];
  }

  const result = [];

  for (const [a, b] of casing.links) {
    if (a === slotId) result.push(b);
    if (b === slotId) result.push(a);
  }

  return result;
}

export function countConnectedFilledSlots(casing, socketLoad, slotId) {
  const connectedSlotIds = getConnectedSlotIds(casing, slotId);

  return connectedSlotIds.reduce((sum, linkedId) => {
    return sum + (socketLoad?.[linkedId] ? 1 : 0);
  }, 0);
}