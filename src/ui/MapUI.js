import MapNode from "./MapNode.js";

export default class MapUI {
  constructor(scene, x, y, mapData, playerWorldState, eventBus) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.eventBus = eventBus;
    this.playerWorldState = playerWorldState;

    this.mapData = mapData || { id: "default", name: "Map", nodes: [] };

    this.nodes = new Map();
    this.selectedNodeId = null;
    this.isBattleLocked = false;
    this.isRegistered = false;

    this.container = this.scene.add.container(x, y);
    
    this.bg = this.scene.add.image(0, 0, "map_bg").setOrigin(0, 0);
    this.bg.setDisplaySize(640, 420);


    this.titleText = this.scene.add.text(20, 15, this.mapData.name || "", {
      fontFamily: "font01",
      fontSize: "20px",
      color: "#752438"
    });

    this.nodesContainer = this.scene.add.container(0, 0);
  


    this.container.add([this.bg,this.titleText, this.nodesContainer]);

    this.register();
    this.render();
  }

  register() {
    if (this.isRegistered || !this.eventBus) {
      return;
    }

    this.eventBus.on("node.clicked", this.onNodeClicked, this);
    this.eventBus.on("node.right_clicked", this.onNodeRightClicked, this);

    this.isRegistered = true;
  }

  destroy() {
    if (this.isRegistered) {
      this.eventBus?.off?.("node.clicked", this.onNodeClicked, this);
      this.eventBus?.off?.("node.right_clicked", this.onNodeRightClicked, this);
      this.isRegistered = false;
    }

    this.clearNodes();
    this.container.destroy(true);
  }

  setMapData(mapData) {
    this.mapData = mapData || { id: "default", name: "Map", nodes: [] };
    this.selectedNodeId = null;
    this.titleText.setText(this.mapData.name || "MAP");
    this.render();
  }

  setPlayerWorldState(playerWorldState) {
    this.playerWorldState = playerWorldState;
    this.refreshFromWorldState();
  }

  render() {
    this.clearNodes();
    this.createNodesFromData();
    this.refreshFromWorldState();
    this.syncNodeLocks();
  }

  clearNodes() {
    this.nodes.forEach((node) => node.destroy());
    this.nodes.clear();
    this.nodesContainer.removeAll(true);
  }

  createNodesFromData() {
    const nodes = this.mapData.nodes || [];

    nodes.forEach((nodeData) => {
      const node = new MapNode(
        this.scene,
        this.nodesContainer,
        nodeData,
        this.eventBus
      );

      this.nodes.set(nodeData.id, node);
    });
  }

  onNodeClicked(event) {
    const { nodeId } = event.payload ?? {};
    if (!nodeId) {
      return;
    }

    if (this.isBattleLocked) {
      return;
    }

    this.selectNode(nodeId);
  }

  onNodeRightClicked(event) {
    const { nodeId } = event.payload ?? {};
    if (!nodeId) {
      return;
    }

    if (this.isBattleLocked) {
      return;
    }

    this.selectNode(nodeId);
  }

  selectNode(nodeId) {
    this.selectedNodeId = nodeId;

    this.nodes.forEach((node, id) => {
      node.setSelected(id === nodeId);
    });
  }

  clearSelection() {
    this.selectedNodeId = null;

    this.nodes.forEach((node) => {
      node.setSelected(false);
    });
  }

  refreshFromWorldState() {
    const mapNodes = this.mapData.nodes || [];

    mapNodes.forEach((nodeData) => {
      const node = this.nodes.get(nodeData.id);
      if (!node) {
        return;
      }

      const defaultState = nodeData.defaultState ?? "default";
      const currentState = this.playerWorldState
        ? this.playerWorldState.getNodeState(nodeData.id, defaultState)
        : defaultState;

      node.setState(currentState);

      const isVisible = this.isNodeVisible(nodeData, currentState);
      node.setVisible(isVisible);
    });

    this.validateSelection();
    this.syncNodeLocks();
  }

  validateSelection() {
    if (!this.selectedNodeId) {
      return;
    }

    const selectedNode = this.nodes.get(this.selectedNodeId);
    if (!selectedNode || !selectedNode.container.visible) {
      this.clearSelection();
    }
  }

  isNodeVisible(nodeData, currentState) {
    if (currentState === "hidden") {
      return false;
    }

    if (typeof nodeData.isVisible === "boolean") {
      return nodeData.isVisible;
    }

    return true;
  }

  setBattleLocked(value) {
    this.isBattleLocked = !!value;
    this.syncNodeLocks();
  }

  syncNodeLocks() {
    this.nodes.forEach((node) => {
      node.setLocked(this.isBattleLocked);
    });
  }

  getBattleLocked() {
    return this.isBattleLocked;
  }

  getNodeById(nodeId) {
    return this.nodes.get(nodeId) || null;
  }

  getNodeState(nodeId) {
    const nodeData = (this.mapData.nodes || []).find((node) => node.id === nodeId);
    if (!nodeData) {
      return null;
    }

    const defaultState = nodeData.defaultState ?? "default";

    return this.playerWorldState
      ? this.playerWorldState.getNodeState(nodeId, defaultState)
      : defaultState;
  }
}