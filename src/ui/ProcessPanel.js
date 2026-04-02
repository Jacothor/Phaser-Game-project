import Phaser from "phaser";
import DraggablePanel from "./DraggablePanel.js";
import { addText } from "../utils/addText.js";
import { ITEM_DATA } from "../data/itemData.js";

const TEXT_COLOR = 0xffffff;
const DISABLED_TEXT_COLOR = 0x888888;
const OK_TEXT_COLOR = 0x7cff7c;
const MISSING_TEXT_COLOR = 0xff7c7c;

export default class ProcessPanel extends DraggablePanel {
  constructor(scene, x, y, processingSystem) {
    super(scene, x, y, 360, 340, {
      depth: 5200,
      onClose: () => {
        this.processingSystem?.closeStation?.("panel_closed");
      }
    });

    this.scene = scene;
    this.processingSystem = processingSystem;

    this.currentNodeData = null;
    this.currentStationDef = null;
    this.currentNode = null;
    this.currentViewModel = null;
    this.selectedRecipeId = null;
    this.processingState = {
      isProcessing: false,
      recipeId: null,
      progress: 0,
      reason: null
    };

    this.layout = {
      titleY: -150,
      recipeListX: -160,
      recipeListY: -118,
      recipeListWidth: 120,
      recipeRowHeight: 24,
      recipeVisibleRows: 8,
      detailsX: -25,
      detailsY: -116,
      progressBarX: -25,
      progressBarY: 86,
      progressBarWidth: 150,
      progressBarHeight: 10,
      startButtonX: 70,
      startButtonY: 115,
      startButtonWidth: 90,
      startButtonHeight: 30
    };

    this.recipeRowObjects = [];
    this.detailObjects = [];

    this.titleText = addText(this.scene, {
      x: 0,
      y: this.layout.titleY,
      text: "Processing",
      size: 20,
      color: TEXT_COLOR,
      originX: 0.5,
      originY: 0.5
    });

    this.recipeListBg = this.scene.add.rectangle(
      this.layout.recipeListX,
      this.layout.recipeListY,
      this.layout.recipeListWidth,
      this.layout.recipeRowHeight * this.layout.recipeVisibleRows,
      0x111111
    );
    this.recipeListBg.setOrigin(0, 0);
    this.recipeListBg.setStrokeStyle(1, 0x752438);

    this.detailsBg = this.scene.add.rectangle(
      this.layout.detailsX,
      this.layout.detailsY,
      170,
      180,
      0x111111
    );
    this.detailsBg.setOrigin(0, 0);
    this.detailsBg.setStrokeStyle(1, 0x752438);

    this.progressLabel = addText(this.scene, {
      x: this.layout.progressBarX + this.layout.progressBarWidth / 2,
      y: this.layout.progressBarY - 10,
      text: "Progress",
      size: 12,
      color: TEXT_COLOR,
      originX: 0.5,
      originY: 1
    });

    this.progressBarBg = this.scene.add.graphics();
    this.progressBarFill = this.scene.add.graphics();

    this.startButton = this.scene.add.rectangle(
      this.layout.startButtonX,
      this.layout.startButtonY,
      this.layout.startButtonWidth,
      this.layout.startButtonHeight,
      0x000000
    );
    this.startButton.setOrigin(0, 0);
    this.startButton.setStrokeStyle(1, 0x752438);

    this.startButtonText = addText(this.scene, {
      x: this.layout.startButtonX + this.layout.startButtonWidth / 2,
      y: this.layout.startButtonY + this.layout.startButtonHeight / 2,
      text: "Start",
      size: 16,
      color: TEXT_COLOR,
      originX: 0.5,
      originY: 0.5
    });

    this.startButton.setInteractive(
      new Phaser.Geom.Rectangle(
        0,
        0,
        this.layout.startButtonWidth,
        this.layout.startButtonHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );

    this.startButton.on("pointerdown", () => {
      this.handleStart();
    });

    this.startButton.on("pointerover", () => {
      this.scene.cursorManager?.setState?.("pointer");
    });

    this.startButton.on("pointerout", () => {
      this.scene.cursorManager?.setState?.("default");
    });

    this.addMany([
      this.titleText,
      this.recipeListBg,
      this.detailsBg,
      this.progressLabel,
      this.progressBarBg,
      this.progressBarFill,
      this.startButton,
      this.startButtonText
    ]);

    this.addBlockInteractionObject(this.startButton);

    this.drawProgressBar(0);
    this.hide();
  }

  showForStation(nodeData, stationDef, viewModel, node = null) {
    this.currentNodeData = nodeData;
    this.currentStationDef = stationDef;
    this.currentNode = node;
    this.currentViewModel = viewModel;

    if (!this.selectedRecipeId || !viewModel.recipes.some((r) => r.id === this.selectedRecipeId)) {
      this.selectedRecipeId = viewModel.recipes[0]?.id ?? null;
    }

    this.titleText.setText((stationDef.name || "Processing").toUpperCase());

    this.refreshRecipeList();
    this.refreshSelectedRecipeDetails();
    this.refreshStartButton();
    this.drawProgressBar(this.processingState.progress ?? 0);

    this.show();
  }

  refreshData(viewModel) {
    this.currentViewModel = viewModel;
    if (!viewModel) {
      return;
    }

    if (!viewModel.recipes.some((r) => r.id === this.selectedRecipeId)) {
      this.selectedRecipeId = viewModel.recipes[0]?.id ?? null;
    }

    this.refreshRecipeList();
    this.refreshSelectedRecipeDetails();
    this.refreshStartButton();
  }

  setProcessingState(data = {}) {
    this.processingState = {
      ...this.processingState,
      ...data
    };

    if (data.recipeId) {
      this.selectedRecipeId = data.recipeId;
    }

    this.drawProgressBar(this.processingState.progress ?? 0);
    this.refreshRecipeList();
    this.refreshSelectedRecipeDetails();
    this.refreshStartButton();
  }

  setProcessingProgress(progress = 0) {
    this.processingState.progress = Phaser.Math.Clamp(progress, 0, 1);
    this.drawProgressBar(this.processingState.progress);
  }

  handleStart() {
    if (!this.currentNodeData || !this.selectedRecipeId) {
      return;
    }

    if (this.processingState.isProcessing) {
      return;
    }

    this.processingSystem?.startProcessing?.(
      this.currentNodeData,
      this.selectedRecipeId,
      this.currentNode
    );
  }

  getSelectedRecipe() {
    return (
      this.currentViewModel?.recipes?.find(
        (recipe) => recipe.id === this.selectedRecipeId
      ) ?? null
    );
  }

  refreshRecipeList() {
    this.clearRecipeRows();

    const recipes = this.currentViewModel?.recipes ?? [];

    recipes.forEach((recipe, index) => {
      const y = this.layout.recipeListY + index * this.layout.recipeRowHeight;

      const rowBg = this.scene.add.rectangle(
        this.layout.recipeListX + 2,
        y + 2,
        this.layout.recipeListWidth - 4,
        this.layout.recipeRowHeight - 4,
        this.selectedRecipeId === recipe.id ? 0x2a1a1a : 0x000000
      );
      rowBg.setOrigin(0, 0);
      rowBg.setStrokeStyle(
        1,
        this.selectedRecipeId === recipe.id ? 0xffd166 : 0x752438
      );

      rowBg.setInteractive(
        new Phaser.Geom.Rectangle(
          0,
          0,
          this.layout.recipeListWidth - 4,
          this.layout.recipeRowHeight - 4
        ),
        Phaser.Geom.Rectangle.Contains
      );

      const rowText = addText(this.scene, {
        x: this.layout.recipeListX + 8,
        y: y + this.layout.recipeRowHeight / 2,
        text: recipe.name,
        size: 12,
        color: recipe.canCraft ? TEXT_COLOR : DISABLED_TEXT_COLOR,
        originX: 0,
        originY: 0.5
      });

      rowBg.on("pointerdown", () => {
        if (this.processingState.isProcessing) {
          return;
        }

        this.selectedRecipeId = recipe.id;
        this.refreshRecipeList();
        this.refreshSelectedRecipeDetails();
        this.refreshStartButton();
      });

      rowBg.on("pointerover", () => {
        this.scene.cursorManager?.setState?.("pointer");
      });

      rowBg.on("pointerout", () => {
        this.scene.cursorManager?.setState?.("default");
      });

      this.add(rowBg);
      this.add(rowText);
      this.addBlockInteractionObject(rowBg);

      this.recipeRowObjects.push(rowBg, rowText);
    });
  }

  refreshSelectedRecipeDetails() {
    this.clearDetailObjects();

    const recipe = this.getSelectedRecipe();
    if (!recipe) {
      return;
    }

    let y = this.layout.detailsY + 8;

    const recipeTitle = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: recipe.name,
      size: 14,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(recipeTitle);
    this.detailObjects.push(recipeTitle);

    y += 22;

    const levelText = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: `Lvl ${recipe.levelRequired}`,
      size: 12,
      color: this.scene.playerState.getSkillLevel(recipe.skillId) >= recipe.levelRequired
        ? OK_TEXT_COLOR
        : MISSING_TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(levelText);
    this.detailObjects.push(levelText);

    y += 18;

    const xpText = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: `XP ${recipe.xpPerProcess}`,
      size: 12,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(xpText);
    this.detailObjects.push(xpText);

    y += 18;

    const timeText = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: `${(recipe.cycleDurationMs / 1000).toFixed(1)}s`,
      size: 12,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(timeText);
    this.detailObjects.push(timeText);

    y += 24;

    const inputsLabel = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: "Inputs",
      size: 12,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(inputsLabel);
    this.detailObjects.push(inputsLabel);

    y += 18;

    recipe.ownedInputs.forEach((input) => {
      const itemDef = ITEM_DATA[input.itemId];
      const ok = input.owned >= input.required;

      const line = addText(this.scene, {
        x: this.layout.detailsX + 8,
        y,
        text: `${itemDef?.name ?? input.itemId} ${input.owned}/${input.required}`,
        size: 12,
        color: ok ? OK_TEXT_COLOR : MISSING_TEXT_COLOR,
        originX: 0,
        originY: 0
      });

      this.add(line);
      this.detailObjects.push(line);
      y += 16;
    });

    y += 8;

    const outputsLabel = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: "Outputs",
      size: 12,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(outputsLabel);
    this.detailObjects.push(outputsLabel);

    y += 18;

    recipe.outputs.forEach((output) => {
      const itemDef = ITEM_DATA[output.itemId];

      const line = addText(this.scene, {
        x: this.layout.detailsX + 8,
        y,
        text: `${itemDef?.name ?? output.itemId} x${output.quantity}`,
        size: 12,
        color: TEXT_COLOR,
        originX: 0,
        originY: 0
      });

      this.add(line);
      this.detailObjects.push(line);
      y += 16;
    });
  }

  refreshStartButton() {
    const recipe = this.getSelectedRecipe();
    const canStart = !!recipe && recipe.canCraft && !this.processingState.isProcessing;

    this.startButton.setFillStyle(canStart ? 0x111111 : 0x222222);
    this.startButtonText.setTint(canStart ? TEXT_COLOR : DISABLED_TEXT_COLOR);

    if (this.processingState.isProcessing) {
      this.startButtonText.setText("Working");
      return;
    }

    this.startButtonText.setText("Start");
  }

  drawProgressBar(progress = 0) {
    const clamped = Phaser.Math.Clamp(progress, 0, 1);
    const x = this.layout.progressBarX;
    const y = this.layout.progressBarY;
    const width = this.layout.progressBarWidth;
    const height = this.layout.progressBarHeight;

    this.progressBarBg.clear();
    this.progressBarBg.fillStyle(0x111111, 1);
    this.progressBarBg.lineStyle(1, 0xffffff, 1);
    this.progressBarBg.fillRect(x, y, width, height);
    this.progressBarBg.strokeRect(x, y, width, height);

    this.progressBarFill.clear();
    this.progressBarFill.fillStyle(0x4caf50, 1);
    this.progressBarFill.fillRect(x, y, width * clamped, height);
  }

  clearRecipeRows() {
    this.recipeRowObjects.forEach((obj) => obj.destroy());
    this.recipeRowObjects = [];
  }

  clearDetailObjects() {
    this.detailObjects.forEach((obj) => obj.destroy());
    this.detailObjects = [];
  }

  show() {
    super.show();

    this.startButton.setInteractive(
      new Phaser.Geom.Rectangle(
        0,
        0,
        this.layout.startButtonWidth,
        this.layout.startButtonHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );
  }

  hide() {
    super.hide();

    this.startButton.disableInteractive();

    this.currentNodeData = null;
    this.currentStationDef = null;
    this.currentNode = null;
    this.currentViewModel = null;
    this.selectedRecipeId = null;
    this.processingState = {
      isProcessing: false,
      recipeId: null,
      progress: 0,
      reason: null
    };

    this.clearRecipeRows();
    this.clearDetailObjects();
    this.drawProgressBar(0);
  }
}