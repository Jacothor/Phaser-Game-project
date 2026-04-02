import BaseSystem from "./BaseSystem.js";
import { GATHERING_NODE_DATA } from "../data/gatheringData.js";
import { PROCESSING_STATION_DATA } from "../data/processingData.js";

export default class UISyncController extends BaseSystem {
  constructor(scene, config = {}) {
    super(scene, config);

    this.mapUI = config.mapUI ?? null;

    this.inventoryPanel = config.inventoryPanel ?? null;
    this.gatherProgressUI = config.gatherProgressUI ?? null;
    this.processPanel = config.processPanel ?? null;
    this.lootPanel = config.lootPanel ?? null;
    this.vitaPanel = config.vitaPanel ?? null;
    this.equipmentPanel = config.equipmentPanel ?? null;

    this.processingSystem = config.processingSystem ?? null;
  }

  register() {
    if (this.isRegistered) {
      return;
    }

    this.on("inventory.changed", this.onInventoryChanged);

    this.on("gathering.started", this.onGatheringStarted);
    this.on("gathering.progressed", this.onGatheringProgressed);
    this.on("gathering.cancelled", this.onGatheringEnded);
    this.on("gathering.stopped", this.onGatheringEnded);
    this.on("gathering.depleted", this.onGatheringEnded);

    this.on("processing.station_opened", this.onProcessingStationOpened);
    this.on("processing.started", this.onProcessingStarted);
    this.on("processing.progressed", this.onProcessingProgressed);
    this.on("processing.cancelled", this.onProcessingEnded);
    this.on("processing.completed", this.onProcessingCompleted);
    this.on("processing.completed_failed", this.onProcessingCompletedFailed);
    this.on("processing.station_closed", this.onProcessingStationClosed);

    this.on("syphon.succeeded", this.onVitaLedgerChanged);
    this.on("syphon.failed", this.onVitaLedgerChanged);
    this.on("syphon.charges_consumed", this.onVitaLedgerChanged);

    this.on("equipment.changed", this.onEquipmentChanged);
    this.on("equipment.socket_changed", this.onEquipmentChanged);

    this.on("combat.loot_generated", this.onCombatLootGenerated);

    this.isRegistered = true;
  }

  onEquipmentChanged() {
    this.equipmentPanel?.refresh?.();
    this.vitaPanel?.refresh?.();
  }

  onVitaLedgerChanged() {
    this.vitaPanel?.refresh?.();
  }

  onInventoryChanged() {
    this.inventoryPanel?.refresh?.();
  }

  onGatheringStarted(event) {
    const { nodeId, gatherDefId } = event.payload ?? {};
    if (!nodeId || !gatherDefId) {
      return;
    }

    const node = this.mapUI?.getNodeById?.(nodeId);
    const gatherDef = GATHERING_NODE_DATA[gatherDefId];

    node?.setSelected?.(true);

    this.gatherProgressUI?.showForNode?.(node, {
      label: gatherDef?.name ?? "Gathering",
    });

    this.gatherProgressUI?.setProgress?.(0);
  }

  onGatheringProgressed(event) {
    const { progress } = event.payload ?? {};
    this.gatherProgressUI?.setProgress?.(progress ?? 0);
  }

  onGatheringEnded() {
    this.gatherProgressUI?.hide?.();
  }

  onProcessingStationOpened(event) {
    const { nodeId, stationDefId } = event.payload ?? {};
    if (!nodeId || !stationDefId || !this.processingSystem) {
      return;
    }

    const node = this.mapUI?.getNodeById?.(nodeId);
    const nodeData = node?.getData?.();
    const stationDef = PROCESSING_STATION_DATA[stationDefId];

    if (!nodeData || !stationDef) {
      return;
    }

    const viewModel = this.processingSystem.buildStationViewModel(
      nodeData,
      stationDef,
    );

    this.processPanel?.showForStation?.(nodeData, stationDef, viewModel, node);
  }

  onProcessingStarted(event) {
    const { nodeId, recipeId, stationDefId } = event.payload ?? {};
    if (!nodeId || !recipeId || !stationDefId) {
      return;
    }

    const node = this.mapUI?.getNodeById?.(nodeId);
    const nodeData = node?.getData?.();
    const stationDef = PROCESSING_STATION_DATA[stationDefId];

    if (!nodeData || !stationDef) {
      return;
    }

    this.processPanel?.setProcessingState?.({
      isProcessing: true,
      nodeData,
      stationDef,
      recipeId,
      progress: 0,
    });
  }

  onProcessingProgressed(event) {
    const { progress } = event.payload ?? {};
    this.processPanel?.setProcessingProgress?.(progress ?? 0);
  }

  onProcessingEnded(event) {
    const { nodeId, recipeId, reason } = event.payload ?? {};
    if (!nodeId || !this.processingSystem) {
      return;
    }

    const node = this.mapUI?.getNodeById?.(nodeId);
    const nodeData = node?.getData?.();
    const stationDef = this.processingSystem.getStationDefFromNode(nodeData);

    if (!nodeData || !stationDef) {
      return;
    }

    this.processPanel?.setProcessingState?.({
      isProcessing: false,
      nodeData,
      stationDef,
      recipeId: recipeId ?? null,
      progress: 0,
      reason: reason ?? null,
    });

    this.processPanel?.refreshData?.(
      this.processingSystem.buildStationViewModel(nodeData, stationDef),
    );
  }

  onProcessingCompleted(event) {
    const { nodeId, recipeId } = event.payload ?? {};
    if (!nodeId || !this.processingSystem) {
      return;
    }

    const node = this.mapUI?.getNodeById?.(nodeId);
    const nodeData = node?.getData?.();
    const stationDef = this.processingSystem.getStationDefFromNode(nodeData);

    if (!nodeData || !stationDef) {
      return;
    }

    node?.setSelected?.(true);

    this.processPanel?.setProcessingState?.({
      isProcessing: false,
      nodeData,
      stationDef,
      recipeId,
      progress: 1,
    });

    this.processPanel?.refreshData?.(
      this.processingSystem.buildStationViewModel(nodeData, stationDef),
    );
  }

  onProcessingCompletedFailed(event) {
    const { nodeId, recipeId, reason } = event.payload ?? {};
    if (!nodeId || !this.processingSystem) {
      return;
    }

    const node = this.mapUI?.getNodeById?.(nodeId);
    const nodeData = node?.getData?.();
    const stationDef = this.processingSystem.getStationDefFromNode(nodeData);

    if (!nodeData || !stationDef) {
      return;
    }

    this.processPanel?.setProcessingState?.({
      isProcessing: false,
      nodeData,
      stationDef,
      recipeId,
      progress: 0,
      reason: reason ?? "failed",
    });

    this.processPanel?.refreshData?.(
      this.processingSystem.buildStationViewModel(nodeData, stationDef),
    );
  }

  onProcessingStationClosed() {
    this.processPanel?.hide?.();
  }

  onCombatLootGenerated() {
    this.lootPanel?.show?.();
    this.lootPanel?.refresh?.();
  }
}
