export default class BaseSystem {
  constructor(scene = null, config = {}) {
    this.scene = scene;
    this.eventBus = config.eventBus ?? null;

    this.isRegistered = false;
    this.disposers = [];
  }

  emit(type, payload = {}, meta = {}) {
    return this.eventBus?.emit?.(type, payload, {
      source: this.getSystemSource(),
      ...meta
    });
  }

  on(type, handler, context = this) {
    if (!this.eventBus?.on) {
      return;
    }

    this.eventBus.on(type, handler, context);

    this.disposers.push(() => {
      this.eventBus?.off?.(type, handler, context);
    });
  }

  off(type, handler, context = this) {
    this.eventBus?.off?.(type, handler, context);
  }

  register() {
    this.isRegistered = true;
  }

  destroy() {
    while (this.disposers.length > 0) {
      const dispose = this.disposers.pop();

      try {
        dispose?.();
      } catch (error) {
        console.warn(`${this.constructor.name}: disposer failed`, error);
      }
    }

    this.isRegistered = false;
  }

  getSystemSource() {
    return this.constructor.name
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      .toLowerCase();
  }
}