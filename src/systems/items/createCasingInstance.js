import { getCasingRule, MAX_CONNECTED_GROUP_SIZE } from "../../data/casingData.js";

let nextCasingUid = 1;

function makeSlotIds(slotCount) {
  return Array.from({ length: slotCount }, (_, i) => `s${i}`);
}

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function splitIntoGroups(slotIds, maxGroupSize) {
  const groups = [];
  let remaining = [...slotIds];

  while (remaining.length > 0) {
    const size = Math.min(maxGroupSize, remaining.length);
    groups.push(remaining.splice(0, size));
  }

  return groups;
}

function buildLinearEdgesForGroup(group) {
  const edges = [];

  for (let i = 0; i < group.length - 1; i++) {
    edges.push([group[i], group[i + 1]]);
  }

  return edges;
}

function generateConnections(slotCount) {
  const slotIds = makeSlotIds(slotCount);

  if (slotCount <= 1) {
    return [];
  }

  const shuffled = shuffle(slotIds);
  const groups = splitIntoGroups(shuffled, MAX_CONNECTED_GROUP_SIZE);

  const edges = [];

  for (const group of groups) {
    edges.push(...buildLinearEdgesForGroup(group));
  }

  return edges;
}

export function createCasingInstance({ woodTier, casingType }) {
  const rule = getCasingRule(woodTier);

  if (!rule) {
    throw new Error(`Unknown wood tier: ${woodTier}`);
  }

  const slotIds = makeSlotIds(rule.slotCount);

  return {
    uid: `casing_${nextCasingUid++}`,
    woodTier,
    casingType,
    slotCount: rule.slotCount,
    slotIds,
    links: generateConnections(rule.slotCount)
  };
}