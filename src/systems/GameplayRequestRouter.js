import BaseSystem from "../ui/BaseSystem.js";
import { ENEMY_DATA } from "../data/enemiesData.js";

export default class GameplayRequestRouter extends BaseSystem {
  constructor(eventBus, config = {}) {
    super(null, { eventBus });

    this.mapUI = config.mapUI ?? null;
    this.combatSystem = config.combatSystem ?? null;
    this.gatheringSystem = config.gatheringSystem ?? null;
    this.processingSystem = config.processingSystem ?? null;
  }

  register() {
    if (this.isRegistered) {
      return;
    }

    this.on("battle.requested", this.onBattleRequested);
    this.on("gathering.requested", this.onGatheringRequested);
    this.on("processing.requested", this.onProcessingRequested);

    this.isRegistered = true;
  }

  getNodeById(nodeId) {
    if (!nodeId || !this.mapUI?.getNodeById) {
      return null;
    }

    return this.mapUI.getNodeById(nodeId);
  }

  onBattleRequested(event) {
    const { nodeId, nodeData, enemyId } = event.payload ?? {};

    if (!nodeId || !nodeData || !enemyId || !this.combatSystem) {
      return;
    }

    const enemyData = ENEMY_DATA[enemyId];
    if (!enemyData) {
      console.warn(`GameplayRequestRouter: enemy "${enemyId}" not found.`);
      return;
    }

    const node = this.getNodeById(nodeId);

    this.combatSystem.startBattle({
      enemyId,
      enemyData,
      nodeData,
      node
    });
  }

  onGatheringRequested(event) {
    const { nodeId, nodeData } = event.payload ?? {};

    if (!nodeId || !nodeData || !this.gatheringSystem) {
      return;
    }

    const node = this.getNodeById(nodeId);
    this.gatheringSystem.startGathering(nodeData, node);
  }

  onProcessingRequested(event) {
    const { nodeId, nodeData } = event.payload ?? {};

    if (!nodeId || !nodeData || !this.processingSystem) {
      return;
    }

    const node = this.getNodeById(nodeId);
    this.processingSystem.openStation(nodeData, node);
  }
}