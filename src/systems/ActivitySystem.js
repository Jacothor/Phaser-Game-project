// src/systems/ActivitySystem.js

export default class ActivitySystem {
  constructor(scene) {
    this.scene = scene;
    this.activeActivity = null;
  }

  hasActiveActivity() {
    return this.activeActivity !== null;
  }

  getActiveActivity() {
    return this.activeActivity;
  }

  isActivityType(type) {
    return this.activeActivity?.type === type;
  }

  startActivity(config = {}) {
    if (!config.type) {
      console.warn("ActivitySystem: missing activity type.");
      return false;
    }

    if (typeof config.durationMs !== "number" || config.durationMs <= 0) {
      console.warn("ActivitySystem: invalid durationMs.");
      return false;
    }

    if (typeof config.onComplete !== "function") {
      console.warn("ActivitySystem: missing onComplete callback.");
      return false;
    }

    this.cancelActivity("replaced");

    const now = this.getNow();

    this.activeActivity = {
      id: config.id ?? `${config.type}_${now}`,
      type: config.type,
      label: config.label ?? config.type,
      startedAt: now,
      updatedAt: now,
      durationMs: config.durationMs,
      elapsedMs: 0,
      progress: 0,

      nodeId: config.nodeId ?? null,
      nodeData: config.nodeData ?? null,

      context: { ...(config.context ?? {}) },

      onStart: config.onStart ?? null,
      onTick: config.onTick ?? null,
      onComplete: config.onComplete,
      onCancel: config.onCancel ?? null
    };

    this.activeActivity.onStart?.(this.activeActivity);

    return true;
  }

  update(delta) {
    if (!this.activeActivity) {
      return;
    }

    const activity = this.activeActivity;

    activity.elapsedMs += delta;
    activity.updatedAt = this.getNow();
    activity.progress = Math.min(activity.elapsedMs / activity.durationMs, 1);

    activity.onTick?.(activity);

    if (activity.elapsedMs >= activity.durationMs) {
      const finishedActivity = activity;
      this.activeActivity = null;
      finishedActivity.onComplete?.(finishedActivity);
    }
  }

  cancelActivity(reason = "cancelled") {
    if (!this.activeActivity) {
      return false;
    }

    const activity = this.activeActivity;
    this.activeActivity = null;

    activity.onCancel?.(activity, reason);
    return true;
  }

  clear() {
    this.activeActivity = null;
  }

  getProgress() {
    return this.activeActivity?.progress ?? 0;
  }

  getProgressPercent() {
    return Math.round(this.getProgress() * 100);
  }

  getRemainingMs() {
    if (!this.activeActivity) {
      return 0;
    }

    return Math.max(
      0,
      this.activeActivity.durationMs - this.activeActivity.elapsedMs
    );
  }

  getNow() {
    return this.scene?.time?.now ?? Date.now();
  }
}