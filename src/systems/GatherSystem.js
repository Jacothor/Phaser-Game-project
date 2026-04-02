import BaseSystem from "../ui/BaseSystem.js";
import {
  GATHERING_NODE_DATA,
  getRandomNodeCapacity
} from "../data/gatheringData.js";

export default class GatheringSystem extends BaseSystem {
  constructor(scene, config = {}) {
    super(scene, config);

    this.playerState = config.playerState ?? null;
    this.playerWorldState = config.playerWorldState ?? null;
    this.inventorySystem = config.inventorySystem ?? null;
    this.inventoryPanel = config.inventoryPanel ?? null;
    this.activitySystem = config.activitySystem ?? null;
    this.mapUI = config.mapUI ?? null;
    this.gatherProgressUI = config.gatherProgressUI ?? null;
    this.bonusSystem = config.bonusSystem ?? null;
  }

  startGathering(nodeData, node = null) {
    const gatherDef = this.resolveGatherDef(nodeData);
    if (!gatherDef) {
      return false;
    }

    if (!this.canGatherNode(nodeData, gatherDef)) {
      return false;
    }

    if (this.activitySystem.hasActiveActivity()) {
      const active = this.activitySystem.getActiveActivity();

      if (active?.type === "gathering" && active.nodeId === nodeData.id) {
        return true;
      }

      this.cancelGathering("node_changed");
    }

    this.ensureNodeCapacity(nodeData, gatherDef);

    const remaining = this.getNodeRemaining(nodeData.id);
    if (remaining <= 0) {
      this.depleteNode(nodeData, gatherDef);
      return false;
    }

    return this.startGatherCycle(nodeData, gatherDef, node);
  }

  resolveGatherDef(nodeData) {
    if (
      !this.playerState ||
      !this.playerWorldState ||
      !this.inventorySystem ||
      !this.activitySystem
    ) {
      console.warn("GatheringSystem: missing dependencies.");
      return null;
    }

    if (
      !nodeData ||
      nodeData.type !== "resource" ||
      nodeData.subType !== "harvest"
    ) {
      return null;
    }

    const gatherNodeDefId = nodeData.gatherNodeDefId ?? null;
    if (!gatherNodeDefId) {
      console.warn(
        `GatheringSystem: node "${nodeData.id}" missing gatherNodeDefId.`
      );
      return null;
    }

    const gatherDef = GATHERING_NODE_DATA[gatherNodeDefId];
    if (!gatherDef) {
      console.warn(
        `GatheringSystem: gather def "${gatherNodeDefId}" not found.`
      );
      return null;
    }

    return gatherDef;
  }

  canGatherNode(nodeData, gatherDef) {
    const nodeState = this.playerWorldState.getNodeState(
      nodeData.id,
      nodeData.defaultState ?? "default"
    );

    if (nodeState === "hidden") {
      return false;
    }

    if (!this.playerState.hasSkillLevel(gatherDef.skillId, gatherDef.levelRequired)) {
      return false;
    }

    if (!this.inventorySystem.canAddItem(gatherDef.outputItemId, 1)) {
      return false;
    }

    return true;
  }

  startGatherCycle(nodeData, gatherDef, node = null) {
    return this.activitySystem.startActivity({
      id: `gather_${nodeData.id}`,
      type: "gathering",
      label: gatherDef.name,
      durationMs: gatherDef.cycleDurationMs,
      nodeId: nodeData.id,
      nodeData,
      context: {
        gatherNodeDefId: gatherDef.id,
        skillId: gatherDef.skillId,
        outputItemId: gatherDef.outputItemId,
        xpPerGather: gatherDef.xpPerGather
      },
      onStart: (activity) => {
        this.setActiveGatherState(nodeData, gatherDef, activity);

        this.emit("gathering.started", {
          nodeId: nodeData.id,
          nodeData,
          gatherDefId: gatherDef.id,
          activity
        });
      },
      onTick: (activity) => {
        this.syncGatherProgress(activity);

        this.emit("gathering.progressed", {
          nodeId: nodeData.id,
          progress: activity.progress ?? 0
        });
      },
      onComplete: (activity) => {
        this.completeGatherCycle(activity, node);
      },
      onCancel: (_activity, reason) => {
        this.clearActiveGatherState(nodeData.id);

        this.emit("gathering.cancelled", {
          nodeId: nodeData.id,
          gatherDefId: gatherDef.id,
          reason
        });
      }
    });
  }

  completeGatherCycle(activity, node = null) {
    const nodeData = activity.nodeData;
    const gatherDef = GATHERING_NODE_DATA[activity.context.gatherNodeDefId];

    if (!nodeData || !gatherDef) {
      return;
    }

    if (!this.canGatherNode(nodeData, gatherDef)) {
      this.clearActiveGatherState(nodeData.id);

      this.emit("gathering.stopped", {
        nodeId: nodeData.id,
        reason: "requirements_failed"
      });
      return;
    }

    const addSuccess = this.inventorySystem.addItem(gatherDef.outputItemId, 1);

    if (!addSuccess) {
      this.clearActiveGatherState(nodeData.id);
      this.gatherProgressUI?.hide?.();

      this.emit("inventory.changed", {
        reason: "gathering_failed_no_space"
      });

      this.emit("gathering.stopped", {
        nodeId: nodeData.id,
        reason: "no_inventory_space"
      });
      return;
    }

    const xpGained = this.getModifiedGatherXp(gatherDef.xpPerGather, {
      nodeId: nodeData.id,
      nodeData,
      gatherDef
    });

    this.playerState.addSkillExp(gatherDef.skillId, xpGained);

    const remainingAfterGather = this.consumeNodeCharge(nodeData.id);

    this.emit("inventory.changed", {
      reason: "gathering_completed",
      itemId: gatherDef.outputItemId,
      quantity: 1
    });

    this.emit("skills.changed", {
      skillId: gatherDef.skillId,
      xpGained,
      reason: "gathering_completed"
    });

    this.emit("gathering.cycle_completed", {
      nodeId: nodeData.id,
      gatherDefId: gatherDef.id,
      outputItemId: gatherDef.outputItemId,
      remainingCharges: remainingAfterGather
    });

    this.applyGatherTriggers({
      nodeId: nodeData.id,
      nodeData,
      gatherDef,
      xpGained
    });

    if (remainingAfterGather <= 0) {
      this.depleteNode(nodeData, gatherDef);
      return;
    }

    this.startGatherCycle(nodeData, gatherDef, node);
  }

  getModifiedGatherXp(baseXp, context = {}) {
    if (!this.bonusSystem) {
      return baseXp;
    }

    const modified = this.bonusSystem.modifyValue("gatherXp", baseXp, context);
    return Math.max(0, Math.floor(modified));
  }

  applyGatherTriggers(context = {}) {
    if (!this.bonusSystem) {
      return;
    }

    const effects = this.bonusSystem.applyTriggers("onGatherComplete", context);

    for (const effect of effects) {
      if (!effect) continue;

      if (effect.kind === "heal") {
        const healAmount = Math.max(
          0,
          Math.floor(
            this.bonusSystem.modifyValue("heal", effect.value ?? 0, {
              triggerType: "onGatherComplete",
              ...context
            })
          )
        );

        if (healAmount > 0) {
          this.playerState.heal(healAmount, this.bonusSystem);
        }
      }
    }
  }

  cancelGathering(reason = "cancelled") {
    if (!this.activitySystem.hasActiveActivity()) {
      return false;
    }

    const active = this.activitySystem.getActiveActivity();
    if (active?.type !== "gathering") {
      return false;
    }

    return this.activitySystem.cancelActivity(reason);
  }

  update() {}

  ensureNodeCapacity(nodeData, gatherDef) {
    const nodeEntry = this.playerWorldState.getNodeData(nodeData.id, {}) ?? {};
    const currentRemaining = nodeEntry.remainingCharges;

    if (typeof currentRemaining === "number" && currentRemaining > 0) {
      return currentRemaining;
    }

    const rolledCapacity = getRandomNodeCapacity(gatherDef);

    this.playerWorldState.setNodeData(nodeData.id, {
      gatherNodeDefId: gatherDef.id,
      remainingCharges: rolledCapacity,
      maxCharges: rolledCapacity,
      depleted: false
    });

    return rolledCapacity;
  }

  getNodeRemaining(nodeId) {
    const nodeData = this.playerWorldState.getNodeData(nodeId, {});
    return Math.max(0, nodeData?.remainingCharges ?? 0);
  }

  consumeNodeCharge(nodeId) {
    const nodeData = this.playerWorldState.getNodeData(nodeId, {}) ?? {};
    const current = Math.max(0, nodeData.remainingCharges ?? 0);
    const next = Math.max(0, current - 1);

    this.playerWorldState.setNodeData(nodeId, {
      remainingCharges: next
    });

    return next;
  }

  depleteNode(nodeData, gatherDef) {
    this.clearActiveGatherState(nodeData.id);

    this.playerWorldState.setNodeState(
      nodeData.id,
      nodeData.worldRules?.onGatherState ?? "hidden",
      gatherDef.respawnTimeMs,
      {
        gatherNodeDefId: gatherDef.id,
        remainingCharges: 0,
        maxCharges: 0,
        depleted: true
      }
    );

    this.mapUI?.refreshFromWorldState?.();

    this.emit("world.node_changed", {
      nodeId: nodeData.id,
      state: nodeData.worldRules?.onGatherState ?? "hidden",
      reason: "gather_depleted"
    });

    this.emit("gathering.depleted", {
      nodeId: nodeData.id,
      gatherDefId: gatherDef.id,
      respawnTimeMs: gatherDef.respawnTimeMs
    });
  }

  setActiveGatherState(nodeData, gatherDef, activity) {
    this.playerWorldState.setNodeData(nodeData.id, {
      gatherNodeDefId: gatherDef.id,
      activeActivityType: "gathering",
      activeProgress: activity.progress ?? 0
    });
  }

  syncGatherProgress(activity) {
    if (!activity?.nodeId) {
      return;
    }

    this.playerWorldState.setNodeData(activity.nodeId, {
      activeProgress: activity.progress ?? 0
    });

    this.gatherProgressUI?.setProgress?.(activity.progress ?? 0);
  }

  clearActiveGatherState(nodeId) {
    const nodeData = this.playerWorldState.getNodeData(nodeId, {}) ?? {};

    delete nodeData.activeActivityType;
    delete nodeData.activeProgress;

    this.playerWorldState.setNodeData(nodeId, nodeData);

    this.gatherProgressUI?.hide?.();
  }
}