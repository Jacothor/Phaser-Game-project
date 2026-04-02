import BaseSystem from "../ui/BaseSystem.js";

export default class NodeInteractionSystem extends BaseSystem {
  constructor(eventBus) {
    super(null, { eventBus });

    this.nodeTypeHandlers = {
      enemy: this.handleEnemyNode,
      resource: this.handleResourceNode,
      station: this.handleStationNode
    };
  }

  register() {
    if (this.isRegistered) {
      return;
    }

    this.on("node.clicked", this.onNodeClicked);
    this.isRegistered = true;
  }

  onNodeClicked(event) {
    const { nodeId, nodeData } = event.payload ?? {};

    if (!nodeId || !nodeData?.type) {
      return;
    }

    const handler = this.nodeTypeHandlers[nodeData.type];
    if (!handler) {
      return;
    }

    handler.call(this, event);
  }

  handleEnemyNode(event) {
    const { nodeId, nodeData } = event.payload ?? {};

    this.emit("battle.requested", {
      nodeId,
      nodeData,
      enemyId: nodeData.enemyId ?? nodeId
    });
  }

  handleResourceNode(event) {
    const { nodeId, nodeData } = event.payload ?? {};

    if (nodeData.subType !== "harvest") {
      return;
    }

    this.emit("gathering.requested", {
      nodeId,
      nodeData,
      gatherNodeDefId: nodeData.gatherNodeDefId ?? null
    });
  }

  handleStationNode(event) {
    const { nodeId, nodeData } = event.payload ?? {};

    this.emit("processing.requested", {
      nodeId,
      nodeData,
      stationDefId: nodeData.stationDefId ?? null
    });
  }
}