import Phaser from "phaser";
import { addText } from "../utils/addText.js";

const TEXT_COLOR = 0xffffff;

export default class MapNode {
  constructor(scene, parentContainer, nodeData, eventBus) {
    this.scene = scene;
    this.parentContainer = parentContainer;
    this.nodeData = nodeData;
    this.eventBus = eventBus;

    this.nodeId = nodeData.id;
    this.currentState = nodeData.defaultState ?? "default";

    this.isHovered = false;
    this.isSelected = false;
    this.isLocked = false;

    this.homeX = nodeData.mapX ?? nodeData.x ?? 0;
    this.homeY = nodeData.mapY ?? nodeData.y ?? 0;

    this.container = this.scene.add.container(this.homeX, this.homeY);

    this.label = addText(this.scene, {
      x: 0,
      y: -30,
      text: nodeData.label || nodeData.name || nodeData.id || "",
      size: 20,
      color: TEXT_COLOR,
      originX: 0.5,
      originY: 0.5
    });

    this.icon = this.scene.add.sprite(
      0,
      0,
      nodeData.iconSheet || "RPG",
      nodeData.iconFrame ?? 0
    );
    this.icon.setDisplaySize(16, 16);
    this.icon.setDepth(1);
    this.icon.setInteractive();

    this.container.add([this.icon, this.label]);
    this.parentContainer.add(this.container);

    this.hoverTween = null;
    this.patrolTween = null;
    this.pendingPatrolDelay = null;
    this.isPatrolPaused = false;

    this.bindEvents();
    this.refreshVisual();
    this.startPatrolIfNeeded();
  }

  bindEvents() {
    this.icon.on("pointerover", () => {
      if (!this.canInteract()) {
        return;
      }

      this.isHovered = true;
      this.scene.cursorManager?.setState?.("pointer");
      this.startHoverAnim();
      this.refreshVisual();
    });

    this.icon.on("pointerout", () => {
      this.isHovered = false;
      this.scene.cursorManager?.setState?.("default");
      this.stopHoverAnim();
      this.refreshVisual();
    });

    this.icon.on("pointerdown", (pointer) => {
      if (!this.canInteract()) {
        return;
      }

      if (pointer.rightButtonDown()) {
        this.emitNodeEvent("node.right_clicked", {
          pointerX: pointer.worldX,
          pointerY: pointer.worldY
        });
        return;
      }

      this.emitNodeEvent("node.clicked", {
        pointerX: pointer.worldX,
        pointerY: pointer.worldY
      });
    });
  }

  emitNodeEvent(type, extraPayload = {}) {
    this.eventBus?.emit?.(
      type,
      {
        nodeId: this.nodeId,
        nodeData: this.nodeData,
        ...extraPayload
      },
      {
        source: "map_node"
      }
    );
  }

  canInteract() {
    return !this.isLocked && this.container.visible && this.container.alpha > 0;
  }

  startPatrolIfNeeded() {
    if (this.nodeData.type !== "enemy") {
      return;
    }

    const radius = this.nodeData.patrolRadius ?? 0;
    if (radius <= 0) {
      return;
    }

    const speed = this.nodeData.patrolSpeed ?? 1200;
    this.moveToRandomPatrolPoint(speed);
  }

  moveToRandomPatrolPoint(duration = 1200) {
    if (this.isPatrolPaused || !this.container?.active) {
      return;
    }

    const radius = this.nodeData.patrolRadius ?? 0;
    if (radius <= 0) {
      return;
    }

    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const distance = Phaser.Math.FloatBetween(4, radius);

    const targetX = this.homeX + Math.cos(angle) * distance;
    const targetY = this.homeY + Math.sin(angle) * distance;

    this.patrolTween = this.scene.tweens.add({
      targets: this.container,
      x: targetX,
      y: targetY,
      duration,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.patrolTween = null;

        if (this.isPatrolPaused || !this.container?.active) {
          return;
        }

        const nextDelay = Phaser.Math.Between(300, 900);
        this.pendingPatrolDelay = this.scene.time.delayedCall(nextDelay, () => {
          this.pendingPatrolDelay = null;

          if (!this.container?.active || this.isPatrolPaused) {
            return;
          }

          this.moveToRandomPatrolPoint(duration);
        });
      }
    });
  }

  pausePatrol() {
    this.isPatrolPaused = true;

    if (this.patrolTween) {
      this.patrolTween.pause();
    }

    this.refreshVisual();
  }

  resumePatrol() {
    this.isPatrolPaused = false;

    if (!this.container?.active || !this.container.visible) {
      return;
    }

    if (this.patrolTween) {
      this.patrolTween.resume();
      return;
    }

    const speed = this.nodeData.patrolSpeed ?? 1200;
    this.moveToRandomPatrolPoint(speed);
    this.refreshVisual();
  }

  startHoverAnim() {
    this.scene.tweens.killTweensOf(this.icon);

    this.hoverTween = this.scene.tweens.add({
      targets: this.icon,
      scaleX: 1.2,
      scaleY: 1.2,
      y: -4,
      duration: 150,
      ease: "Back.easeOut"
    });
  }

  stopHoverAnim() {
    this.scene.tweens.killTweensOf(this.icon);

    this.hoverTween = this.scene.tweens.add({
      targets: this.icon,
      scaleX: 1,
      scaleY: 1,
      y: 0,
      duration: 120,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.hoverTween = null;
      }
    });
  }

  setLocked(value) {
    this.isLocked = !!value;

    if (this.isLocked) {
      this.isHovered = false;
      this.stopHoverAnim();
    }

    this.refreshVisual();
  }

  setSelected(value) {
    this.isSelected = !!value;
    this.refreshVisual();
  }

  setState(stateName) {
    this.currentState = stateName ?? "default";
    this.refreshVisual();
  }

  setVisible(value) {
    this.container.setVisible(!!value);
    this.refreshVisual();
  }

  getId() {
    return this.nodeId;
  }

  getData() {
    return this.nodeData;
  }

  getState() {
    return this.currentState;
  }

  refreshVisual() {
    let alpha = 1;
    let tint = 0xffffff;

    if (this.currentState === "hidden") {
      alpha = 0;
    } else {
      if (this.isHovered) {
        tint = 0xffd588;
      }

      switch (this.currentState) {
        case "defeated":
        case "harvested":
        case "opened":
        case "looted":
          alpha = 0.6;
          tint = 0x777777;
          break;

        case "moved":
        case "revealed":
        case "active":
          tint = 0xaaffcc;
          break;

        case "blocked":
          tint = 0xff8888;
          break;
      }

      if (this.isSelected) {
        tint = 0xffd166;
      }

      if (this.isPatrolPaused) {
        tint = 0xff0000;
      }

      if (this.isLocked) {
        tint = 0x999999;
      }
    }

    this.label.setVisible(alpha > 0 && this.isHovered && !this.isLocked);
    this.icon.setTint(tint);
    this.container.setAlpha(alpha);
    this.container.setVisible(alpha > 0);
  }

  destroy() {
    if (this.hoverTween) {
      this.hoverTween.stop();
      this.hoverTween = null;
    }

    if (this.patrolTween) {
      this.patrolTween.stop();
      this.patrolTween = null;
    }

    if (this.pendingPatrolDelay) {
      this.pendingPatrolDelay.remove(false);
      this.pendingPatrolDelay = null;
    }

    this.scene.tweens.killTweensOf(this.icon);
    this.container.destroy(true);
  }
}