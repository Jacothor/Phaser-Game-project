import Phaser from "phaser";
import BasePanel from "./BasePanel.js";

export default class DraggablePanel extends BasePanel {
  constructor(scene, x, y, width, height, config = {}) {
    super(scene, x, y, width, height, config);

    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    this.onPanelPointerDown = this.onPanelPointerDown.bind(this);
    this.onScenePointerMove = this.onScenePointerMove.bind(this);
    this.onScenePointerUp = this.onScenePointerUp.bind(this);
    this.onSceneGameOut = this.onSceneGameOut.bind(this);

    this.panelBg.on("pointerdown", this.onPanelPointerDown);

    this.scene.input.on("pointermove", this.onScenePointerMove);
    this.scene.input.on("pointerup", this.onScenePointerUp);
    this.scene.input.on("pointerupoutside", this.onScenePointerUp);
    this.scene.input.on("gameout", this.onSceneGameOut);
  }

  onPanelPointerDown(pointer) {
    if (!this.isOpen) {
      return;
    }

    if (this.isPointerOnBlockedObject(pointer)) {
      return;
    }

    this.isDragging = true;
    this.dragOffsetX = pointer.worldX - this.container.x;
    this.dragOffsetY = pointer.worldY - this.container.y;
  }

  onScenePointerMove(pointer) {
    if (!this.isDragging || !pointer.isDown) {
      return;
    }

    this.container.x = pointer.worldX - this.dragOffsetX;
    this.container.y = pointer.worldY - this.dragOffsetY;
  }

  onScenePointerUp() {
    this.isDragging = false;
  }

  onSceneGameOut() {
    this.isDragging = false;
  }

  stopDragging() {
    this.isDragging = false;
  }

  hide() {
    this.stopDragging();
    super.hide();
  }

  destroy() {
    this.scene.input.off("pointermove", this.onScenePointerMove);
    this.scene.input.off("pointerup", this.onScenePointerUp);
    this.scene.input.off("pointerupoutside", this.onScenePointerUp);
    this.scene.input.off("gameout", this.onSceneGameOut);

    this.panelBg?.off?.("pointerdown", this.onPanelPointerDown);

    super.destroy();
  }
}