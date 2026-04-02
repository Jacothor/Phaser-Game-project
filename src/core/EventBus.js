export default class EventBus {
  constructor() {
    this.currentQueue = [];
    this.nextQueue = [];
    this.listeners = new Map();
    this.isProcessing = false;
    this.sequence = 0;
  }

  createEvent(type, payload = {}, meta = {}) {
    return {
      id: `evt_${++this.sequence}`,
      type,
      payload,
      meta: {
        source: meta.source ?? "client",
        timestamp: meta.timestamp ?? Date.now(),
        ...meta
      }
    };
  }

  emit(type, payload = {}, meta = {}) {
    const event = this.createEvent(type, payload, meta);

    if (this.isProcessing) {
      this.nextQueue.push(event);
    } else {
      this.currentQueue.push(event);
    }

    return event;
  }

  on(type, handler, context = null) {
    if (!type || typeof handler !== "function") {
      return () => {};
    }

    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    const entry = { handler, context };
    this.listeners.get(type).add(entry);

    return () => {
      this.off(type, handler, context);
    };
  }

  off(type, handler, context = null) {
    const entries = this.listeners.get(type);
    if (!entries) {
      return;
    }

    for (const entry of entries) {
      if (entry.handler === handler && entry.context === context) {
        entries.delete(entry);
      }
    }

    if (entries.size === 0) {
      this.listeners.delete(type);
    }
  }

  clear(type = null) {
    if (type) {
      this.listeners.delete(type);
      return;
    }

    this.listeners.clear();
  }

  process(maxEvents = Infinity) {
    if (this.isProcessing) {
      return 0;
    }

    this.isProcessing = true;

    let processedCount = 0;
    let index = 0;

    try {
      while (
        index < this.currentQueue.length &&
        processedCount < maxEvents
      ) {
        const event = this.currentQueue[index++];
        processedCount += 1;

        const entries = this.listeners.get(event.type);
        if (!entries || entries.size === 0) {
          continue;
        }

        for (const entry of [...entries]) {
          entry.handler.call(entry.context, event);
        }
      }

      if (index > 0) {
        this.currentQueue.splice(0, index);
      }
    } finally {
      this.isProcessing = false;
    }

    if (this.currentQueue.length === 0 && this.nextQueue.length > 0) {
      this.currentQueue = this.nextQueue;
      this.nextQueue = [];
    }

    return processedCount;
  }

  hasPendingEvents() {
    return this.currentQueue.length > 0 || this.nextQueue.length > 0;
  }

  destroy() {
    this.currentQueue.length = 0;
    this.nextQueue.length = 0;
    this.listeners.clear();
    this.isProcessing = false;
  }
}