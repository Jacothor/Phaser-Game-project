let nextItemUid = 1;

export function createItemStack(defId, quantity = 1) {
  return {
    uid: `item_${nextItemUid++}`,
    defId,
    quantity: Math.max(1, quantity)
  };
}