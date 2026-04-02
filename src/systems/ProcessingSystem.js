import BaseSystem from "../ui/BaseSystem.js";
import {
  PROCESSING_STATION_DATA,
  PROCESSING_RECIPE_DATA
} from "../data/processingData.js";

export default class ProcessingSystem extends BaseSystem {
  constructor(scene, config = {}) {
    super(scene, config);

    this.playerState = config.playerState ?? null;
    this.playerWorldState = config.playerWorldState ?? null;
    this.inventorySystem = config.inventorySystem ?? null;
    this.inventoryPanel = config.inventoryPanel ?? null;
    this.activitySystem = config.activitySystem ?? null;
    this.mapUI = config.mapUI ?? null;
    this.processPanel = config.processPanel ?? null;
    this.bonusSystem = config.bonusSystem ?? null;
  }

  openStation(nodeData, node = null) {
    if (!nodeData || nodeData.type !== "station") {
      return false;
    }

    const stationDefId = nodeData.stationDefId ?? null;
    if (!stationDefId) {
      console.warn(`ProcessingSystem: node "${nodeData.id}" missing stationDefId.`);
      return false;
    }

    const stationDef = PROCESSING_STATION_DATA[stationDefId];
    if (!stationDef) {
      console.warn(`ProcessingSystem: station "${stationDefId}" not found.`);
      return false;
    }

    const active = this.activitySystem?.getActiveActivity?.();
    if (active?.type === "processing" && active.nodeId !== nodeData.id) {
      this.cancelProcessing("node_changed");
    }

    this.emit("processing.station_opened", {
      nodeId: nodeData.id,
      stationDefId: stationDef.id
    });

    return true;
  }

  startProcessing(nodeData, recipeId, node = null) {
    if (!this.playerState || !this.inventorySystem || !this.activitySystem) {
      console.warn("ProcessingSystem: missing dependencies.");
      return false;
    }

    if (!nodeData || nodeData.type !== "station") {
      return false;
    }

    const stationDef = this.getStationDefFromNode(nodeData);
    if (!stationDef) {
      return false;
    }

    const recipe = PROCESSING_RECIPE_DATA[recipeId];
    if (!recipe) {
      console.warn(`ProcessingSystem: recipe "${recipeId}" not found.`);
      return false;
    }

    if (recipe.stationType !== stationDef.stationType) {
      console.warn("ProcessingSystem: recipe does not match station type.");
      return false;
    }

    const validation = this.validateRecipe(recipe);
    if (!validation.ok) {
      this.emit("processing.start_failed", {
        nodeId: nodeData.id,
        recipeId,
        reason: validation.reason
      });
      return false;
    }

    const active = this.activitySystem.getActiveActivity();
    if (active?.type === "processing") {
      this.cancelProcessing("replaced");
    }

    const reserveSuccess = this.consumeRecipeInputs(recipe);
    if (!reserveSuccess) {
      this.emit("processing.start_failed", {
        nodeId: nodeData.id,
        recipeId,
        reason: "input_reservation_failed"
      });
      return false;
    }

    const started = this.activitySystem.startActivity({
      id: `process_${nodeData.id}_${recipe.id}`,
      type: "processing",
      label: recipe.name,
      durationMs: recipe.cycleDurationMs,
      nodeId: nodeData.id,
      nodeData,
      context: {
        stationDefId: stationDef.id,
        recipeId: recipe.id,
        reservedInputs: recipe.inputs.map((input) => ({ ...input })),
        outputs: recipe.outputs.map((output) => ({ ...output })),
        skillId: recipe.skillId,
        xpPerProcess: recipe.xpPerProcess
      },
      onStart: (activity) => {
        this.setActiveProcessingState(nodeData, recipe, activity);

        this.emit("processing.started", {
          nodeId: nodeData.id,
          recipeId: recipe.id,
          stationDefId: stationDef.id
        });
      },
      onTick: (activity) => {
        this.syncProcessingProgress(activity);

        this.emit("processing.progressed", {
          nodeId: nodeData.id,
          recipeId: recipe.id,
          progress: activity.progress ?? 0
        });
      },
      onComplete: (activity) => {
        this.completeProcessing(activity, node);
      },
      onCancel: (activity, reason) => {
        this.refundReservedInputs(activity);
        this.clearActiveProcessingState(nodeData.id);

        this.emit("processing.cancelled", {
          nodeId: nodeData.id,
          recipeId: recipe.id,
          reason
        });
      }
    });

    if (!started) {
      this.refundRecipeInputs(recipe);
      return false;
    }

    return true;
  }

  completeProcessing(activity, node = null) {
    const nodeData = activity.nodeData;
    const recipe = PROCESSING_RECIPE_DATA[activity.context.recipeId];
    const stationDef = this.getStationDefFromNode(nodeData);

    if (!nodeData || !recipe || !stationDef) {
      return;
    }

    const outputAdded = this.addRecipeOutputs(recipe);
    if (!outputAdded) {
      this.refundReservedInputs(activity);
      this.clearActiveProcessingState(nodeData.id);

      this.emit("processing.completed_failed", {
        nodeId: nodeData.id,
        recipeId: recipe.id,
        reason: "no_inventory_space"
      });

      return;
    }

    const xpGained = this.getModifiedProcessXp(recipe.xpPerProcess, {
      nodeId: nodeData.id,
      nodeData,
      recipe,
      stationDef
    });

    this.playerState.addSkillExp(recipe.skillId, xpGained);
    this.clearActiveProcessingState(nodeData.id);

    this.inventoryPanel?.refresh?.();

    this.emit("inventory.changed", {
      reason: "processing_completed",
      recipeId: recipe.id,
      outputs: recipe.outputs
    });

    this.emit("skills.changed", {
      skillId: recipe.skillId,
      xpGained,
      reason: "processing_completed"
    });

    this.emit("processing.completed", {
      nodeId: nodeData.id,
      recipeId: recipe.id,
      stationDefId: stationDef.id
    });

    this.applyProcessTriggers({
      nodeId: nodeData.id,
      nodeData,
      recipe,
      stationDef,
      xpGained
    });
  }

  getModifiedProcessXp(baseXp, context = {}) {
    if (!this.bonusSystem) {
      return baseXp;
    }

    const modified = this.bonusSystem.modifyValue("processXp", baseXp, context);
    return Math.max(0, Math.floor(modified));
  }

  applyProcessTriggers(context = {}) {
    if (!this.bonusSystem) {
      return;
    }

    const effects = this.bonusSystem.applyTriggers("onProcessComplete", context);

    for (const effect of effects) {
      if (!effect) continue;

      if (effect.kind === "heal") {
        const healAmount = Math.max(
          0,
          Math.floor(
            this.bonusSystem.modifyValue("heal", effect.value ?? 0, {
              triggerType: "onProcessComplete",
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

  cancelProcessing(reason = "cancelled") {
    const active = this.activitySystem?.getActiveActivity?.();
    if (!active || active.type !== "processing") {
      return false;
    }

    return this.activitySystem.cancelActivity(reason);
  }

  closeStation(reason = "panel_closed") {
    this.cancelProcessing(reason);

    this.emit("processing.station_closed", {
      reason
    });
  }

  update() {}

  getStationDefFromNode(nodeData) {
    if (!nodeData?.stationDefId) {
      return null;
    }

    return PROCESSING_STATION_DATA[nodeData.stationDefId] ?? null;
  }

  getRecipesForNode(nodeData) {
    const stationDef = this.getStationDefFromNode(nodeData);
    if (!stationDef) {
      return [];
    }

    return stationDef.recipeIds
      .map((recipeId) => PROCESSING_RECIPE_DATA[recipeId] ?? null)
      .filter(Boolean);
  }

  buildStationViewModel(nodeData, stationDef) {
    const recipes = this.getRecipesForNode(nodeData).map((recipe) => ({
      ...recipe,
      canCraft: this.canCraftRecipe(recipe),
      missingInputs: this.getMissingInputs(recipe),
      ownedInputs: recipe.inputs.map((input) => ({
        itemId: input.itemId,
        required: input.quantity,
        owned: this.inventorySystem.countItem(input.itemId)
      }))
    }));

    return {
      nodeData,
      stationDef,
      recipes
    };
  }

  validateRecipe(recipe) {
    if (!this.playerState.hasSkillLevel(recipe.skillId, recipe.levelRequired)) {
      return { ok: false, reason: "level_too_low" };
    }

    for (const input of recipe.inputs) {
      if (!this.inventorySystem.hasItem(input.itemId, input.quantity)) {
        return { ok: false, reason: "missing_inputs" };
      }
    }

    if (!this.canReceiveOutputs(recipe.outputs)) {
      return { ok: false, reason: "no_inventory_space" };
    }

    return { ok: true };
  }

  canCraftRecipe(recipe) {
    return this.validateRecipe(recipe).ok;
  }

  getMissingInputs(recipe) {
    return recipe.inputs
      .map((input) => {
        const owned = this.inventorySystem.countItem(input.itemId);
        const missing = Math.max(0, input.quantity - owned);

        return {
          itemId: input.itemId,
          required: input.quantity,
          owned,
          missing
        };
      })
      .filter((entry) => entry.missing > 0);
  }

  canReceiveOutputs(outputs = []) {
    for (const output of outputs) {
      if (!this.inventorySystem.canAddItem(output.itemId, output.quantity)) {
        return false;
      }
    }

    return true;
  }

  consumeRecipeInputs(recipe) {
    for (const input of recipe.inputs) {
      let remaining = input.quantity;
      const items = this.inventorySystem.getItems();

      for (const entry of [...items]) {
        if (entry.defId !== input.itemId) {
          continue;
        }

        const removeAmount = Math.min(entry.quantity, remaining);
        const removed = this.inventorySystem.removeItemByUid(entry.uid, removeAmount);

        if (!removed) {
          return false;
        }

        remaining -= removeAmount;

        if (remaining <= 0) {
          break;
        }
      }

      if (remaining > 0) {
        return false;
      }
    }

    this.emit("inventory.changed", {
      reason: "processing_inputs_reserved",
      inputs: recipe.inputs
    });

    return true;
  }

  refundRecipeInputs(recipe) {
    for (const input of recipe.inputs) {
      this.inventorySystem.addItem(input.itemId, input.quantity);
    }

    this.emit("inventory.changed", {
      reason: "processing_inputs_refunded",
      inputs: recipe.inputs
    });
  }

  refundReservedInputs(activity) {
    const reservedInputs = activity?.context?.reservedInputs ?? [];

    for (const input of reservedInputs) {
      this.inventorySystem.addItem(input.itemId, input.quantity);
    }

    this.emit("inventory.changed", {
      reason: "processing_reserved_inputs_refunded",
      inputs: reservedInputs
    });
  }

  addRecipeOutputs(recipe) {
    if (!this.canReceiveOutputs(recipe.outputs)) {
      return false;
    }

    for (const output of recipe.outputs) {
      this.inventorySystem.addItem(output.itemId, output.quantity);
    }

    return true;
  }

  setActiveProcessingState(nodeData, recipe, activity) {
    this.playerWorldState?.setNodeData?.(nodeData.id, {
      activeActivityType: "processing",
      activeRecipeId: recipe.id,
      activeProgress: activity.progress ?? 0
    });
  }

  syncProcessingProgress(activity) {
    if (!activity?.nodeId) {
      return;
    }

    this.playerWorldState?.setNodeData?.(activity.nodeId, {
      activeProgress: activity.progress ?? 0
    });

    this.processPanel?.setProcessingProgress?.(activity.progress ?? 0);
  }

  clearActiveProcessingState(nodeId) {
    const nodeData = this.playerWorldState?.getNodeData?.(nodeId, {}) ?? {};

    delete nodeData.activeActivityType;
    delete nodeData.activeRecipeId;
    delete nodeData.activeProgress;

    this.playerWorldState?.setNodeData?.(nodeId, nodeData);
  }
}