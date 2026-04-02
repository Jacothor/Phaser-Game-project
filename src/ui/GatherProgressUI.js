// src/ui/GatherProgressUI.js

import Phaser from "phaser";
import { addText } from "../utils/addText.js";

export default class GatherProgressUI {
  constructor(scene) {
    this.scene = scene;

    this.targetNode = null;
    this.targetLabel = "";

    this.layout = {
      offsetY: -26,
      width: 56,
      height: 8,
      labelOffsetY: -10,
      depth: 5500
    };

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(this.layout.depth);
    this.container.setVisible(false);

    this.barBg = this.scene.add.graphics();
    this.barFill = this.scene.add.graphics();

    this.labelText = addText(this.scene, {
      x: 0,
      y: this.layout.labelOffsetY,
      text: "",
      size: 12,
      color: 0xffffff,
      originX: 0.5,
      originY: 1
    });

    this.container.add([this.barBg, this.barFill, this.labelText]);
  }

  showForNode(node, config = {}) {
    if (!node?.container) {
      this.hide();
      return;
    }

    this.targetNode = node;
    this.targetLabel = config.label ?? "";
    this.labelText.setText(this.targetLabel.toUpperCase());

    this.setProgress(0);
    this.updatePosition();
    this.container.setVisible(true);
  }

  setProgress(progress = 0) {
    const clamped = Phaser.Math.Clamp(progress, 0, 1);
    const x = -this.layout.width / 2;
    const y = 0;

    this.barBg.clear();
    this.barBg.fillStyle(0x111111, 1);
    this.barBg.lineStyle(1, 0xffffff, 1);
    this.barBg.fillRect(x, y, this.layout.width, this.layout.height);
    this.barBg.strokeRect(x, y, this.layout.width, this.layout.height);

    this.barFill.clear();
    this.barFill.fillStyle(0x4caf50, 1);
    this.barFill.fillRect(x, y, this.layout.width * clamped, this.layout.height);
  }

  update() {
    if (!this.container.visible || !this.targetNode?.container) {
      return;
    }

    if (!this.targetNode.container.visible) {
      this.hide();
      return;
    }

    this.updatePosition();
  }

  updatePosition() {
    if (!this.targetNode?.container) {
      return;
    }

    const worldMatrix = this.targetNode.container.getWorldTransformMatrix();

    this.container.setPosition(
      worldMatrix.tx,
      worldMatrix.ty + this.layout.offsetY
    );
  }

  hide() {
    this.targetNode = null;
    this.targetLabel = "";
    this.container.setVisible(false);
    this.barBg.clear();
    this.barFill.clear();
    this.labelText.setText("");
  }

  destroy() {
    this.hide();
    this.container.destroy(true);
  }
}