export default class PlayerWorldState {
  constructor() {
    this.nodeStates = new Map();
  }

  getNow() {
    return Date.now();
  }

  getRawNodeEntry(nodeId) {
    return this.nodeStates.get(nodeId) ?? null;
  }

  getNodeEntry(nodeId) {
    const entry = this.getRawNodeEntry(nodeId);

    if (!entry) {
      return null;
    }

    if (entry.resetAt !== null && this.getNow() >= entry.resetAt) {
      this.nodeStates.delete(nodeId);
      return null;
    }

    return entry;
  }

  getNodeState(nodeId, defaultState = "default") {
    const entry = this.getNodeEntry(nodeId);
    return entry ? entry.state : defaultState;
  }

  hasNodeState(nodeId) {
    return this.getNodeEntry(nodeId) !== null;
  }

  isNodeInState(nodeId, state, defaultState = "default") {
    return this.getNodeState(nodeId, defaultState) === state;
  }

  setNodeState(nodeId, state, durationMs = null, extraData = {}) {
    this.nodeStates.set(nodeId, {
      state,
      setAt: this.getNow(),
      resetAt: durationMs !== null ? this.getNow() + durationMs : null,
      data: { ...extraData }
    });
  }

  clearNodeState(nodeId) {
    this.nodeStates.delete(nodeId);
  }

  resetNodeToDefault(nodeId) {
    this.clearNodeState(nodeId);
  }

  getNodeData(nodeId, defaultValue = null) {
    const entry = this.getNodeEntry(nodeId);
    return entry ? entry.data : defaultValue;
  }

  setNodeData(nodeId, data = {}) {
    const entry = this.getNodeEntry(nodeId);

    if (!entry) {
      this.nodeStates.set(nodeId, {
        state: "default",
        setAt: this.getNow(),
        resetAt: null,
        data: { ...data }
      });
      return;
    }

    entry.data = { ...entry.data, ...data };
  }

  getNodeResetTime(nodeId) {
    const entry = this.getNodeEntry(nodeId);
    return entry ? entry.resetAt : null;
  }

  getNodeTimeLeft(nodeId) {
    const entry = this.getNodeEntry(nodeId);

    if (!entry || entry.resetAt === null) {
      return null;
    }

    return Math.max(0, entry.resetAt - this.getNow());
  }

  isNodeExpired(nodeId) {
    const entry = this.getRawNodeEntry(nodeId);

    if (!entry || entry.resetAt === null) {
      return false;
    }

    return this.getNow() >= entry.resetAt;
  }

  cleanupExpiredNodeStates() {
    const now = this.getNow();

    for (const [nodeId, entry] of this.nodeStates.entries()) {
      if (entry.resetAt !== null && now >= entry.resetAt) {
        this.nodeStates.delete(nodeId);
      }
    }
  }

  getAllActiveNodeStates() {
    this.cleanupExpiredNodeStates();

    const result = {};

    for (const [nodeId, entry] of this.nodeStates.entries()) {
      result[nodeId] = {
        state: entry.state,
        setAt: entry.setAt,
        resetAt: entry.resetAt,
        data: { ...entry.data }
      };
    }

    return result;
  }

  loadFromObject(savedData = {}) {
    this.nodeStates.clear();

    Object.entries(savedData).forEach(([nodeId, entry]) => {
      this.nodeStates.set(nodeId, {
        state: entry.state ?? "default",
        setAt: entry.setAt ?? this.getNow(),
        resetAt: entry.resetAt ?? null,
        data: { ...(entry.data ?? {}) }
      });
    });

    this.cleanupExpiredNodeStates();
  }

  toSaveObject() {
    return this.getAllActiveNodeStates();
  }
}