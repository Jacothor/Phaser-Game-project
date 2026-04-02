import Phaser from "phaser";

export default class GamePanel {
  constructor(scene, x, y, actions = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.actions = actions;

    this.layout = {
      buttonWidth: 70,
      buttonHeight: 83,
      buttonGap: 12,
      hoverScale: 1.1,
      baseScale: 1,
      depth: 4000,
    };

    this.container = this.scene.add.container(x, y);
    this.container.setDepth(this.layout.depth);

    // Pick the frame numbers that match your sheet.
    // Replace these with the exact frames you want.
    this.buttonDefs = [
      { id: "button1", frame: 0, onClick: this.actions.onButton1Click },
      { id: "button2", frame: 1, onClick: this.actions.onButton2Click },
      { id: "button3", frame: 2, onClick: this.actions.onButton3Click },
      { id: "button4", frame: 3, onClick: this.actions.onButton4Click },
      { id: "button5", frame: 4, onClick: this.actions.onButton5Click },
      { id: "button6", frame: 5, onClick: this.actions.onButton6Click },
      { id: "button7", frame: 6, onClick: this.actions.onButton7Click },
    ];

    this.buttons = [];
    this.createButtons();
  }

  createButtons() {
    const totalWidth =
      this.buttonDefs.length * this.layout.buttonWidth +
      (this.buttonDefs.length - 1) * this.layout.buttonGap;

    const startX = -totalWidth / 2 + this.layout.buttonWidth / 2;

    this.buttonDefs.forEach((def, index) => {
      const x =
        startX + index * (this.layout.buttonWidth + this.layout.buttonGap);

      const button = this.scene.add.sprite(
        x,
        0,
        "gamepanel_buttons",
        def.frame,
      );
      button.setInteractive({ useHandCursor: false });
      button.setScale(this.layout.baseScale);

      button.on("pointerdown", () => {
        def.onClick?.();
      });

      button.on("pointerover", () => {
        this.scene.cursorManager?.setState?.("pointer");
        button.setTint(0xffffaa);
        button.setScale(this.layout.hoverScale);
      });

      button.on("pointerout", () => {
        this.scene.cursorManager?.setState?.("default");
        button.clearTint();
        button.setScale(this.layout.baseScale);
      });

      this.container.add(button);
      this.buttons.push(button);
    });
  }

  destroy() {
    this.container.destroy(true);
  }
}
