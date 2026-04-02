import Phaser from "phaser";

import PlayerPanel from "../ui/PlayerPanel.js";
import GamePanel from "../ui/GamePanel.js";
import BattlePanel from "../ui/BattlePanel.js";
import InventoryPanel from "../ui/InventoryPanel.js";
import LootPanel from "../ui/LootPanel.js";
import GatherProgressUI from "../ui/GatherProgressUI.js";
import ProcessPanel from "../ui/ProcessPanel.js";
import MapUI from "../ui/MapUI.js";
import VitaPanel from "../ui/VitaPanel.js";
import EquipmentPanel from "../ui/equipmentPanel.js";

import CursorManager from "../systems/CursorManager.js";
import CombatSystem from "../systems/CombatSystem.js";
import InventorySystem from "../systems/InventorySystem.js";
import LootSystem from "../systems/LootSystem.js";
import ActivitySystem from "../systems/ActivitySystem.js";
import GatheringSystem from "../systems/GatherSystem.js";
import ProcessingSystem from "../systems/ProcessingSystem.js";
import NodeInteractionSystem from "../systems/NodeInteractionSystem.js";
import GameplayRequestRouter from "../systems/GameplayRequestRouter.js";
import UISyncController from "../ui/UISyncController.js";
import BonusSystem from "../systems/BonusSystem.js";
import EquipmentSystem from "../systems/EquipmentSystem.js";
import SyphonSystem from "../systems/SyphonSystem.js";

import PlayerState from "../state/PlayerState.js";
import PlayerWorldState from "../state/PlayerWorldState.js";
import EventBus from "../core/EventBus.js";
//TEST IMPORTS
import { TEST_MAP_DATA } from "../data/mapData.js";
import { createCasingInstance } from "../systems/items/createCasingInstance.js";
import { createAssembledEquipmentInstance } from "../systems/items/createAssembledEquipmentInstance.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");

    this.layout = {
      playerPanel: { x: 140, y: 580 },
      battlePanel: { x: 140, y: 310 },
      inventoryPanel: { x: 1110, y: 555 },
      lootPanel: { x: 140, y: 310 },
      processPanel: { x: 930, y: 520 },
      gamePanel: { x: 640, y: 660 },
      map: { x: 320, y: 180 },
      vitaPanel: { x: 550, y: 185 },
      equipmentPanel: { x: 1020, y: 195 },
    };
  }

  create() {
    this.input.mouse.disableContextMenu();

    this.createCoreState();
    this.createCoreSystems();
    this.createUI();
    this.connectGameplay();
    this.registerLifecycle();
  }

  createCoreState() {
    this.eventBus = new EventBus();
    this.playerState = new PlayerState();
    this.playerWorldState = new PlayerWorldState();
  }

  createCoreSystems() {
    this.cursorManager = new CursorManager(this);
    this.cursorManager.create();

    this.activitySystem = new ActivitySystem(this);
    this.inventorySystem = new InventorySystem(this.playerState);
    this.lootSystem = new LootSystem();
    this.gatherProgressUI = new GatherProgressUI(this);

    this.nodeInteractionSystem = new NodeInteractionSystem(this.eventBus);
    this.nodeInteractionSystem.register();

    this.bonusSystem = new BonusSystem(this, {
      eventBus: this.eventBus,
      playerState: this.playerState,
    });

    this.equipmentSystem = new EquipmentSystem(this, {
      eventBus: this.eventBus,
      playerState: this.playerState,
      bonusSystem: this.bonusSystem,
    });
  }

  createUI() {
    this.playerPanel = new PlayerPanel(
      this,
      this.layout.playerPanel.x,
      this.layout.playerPanel.y,
    );

    this.battlePanel = new BattlePanel(
      this,
      this.layout.battlePanel.x,
      this.layout.battlePanel.y,
    );
    this.battlePanel.hide();

    this.mapUI = new MapUI(
      this,
      this.layout.map.x,
      this.layout.map.y,
      TEST_MAP_DATA,
      this.playerWorldState,
      this.eventBus,
    );

    this.inventoryPanel = new InventoryPanel(
      this,
      this.layout.inventoryPanel.x,
      this.layout.inventoryPanel.y,
      this.inventorySystem,
    );
    this.inventoryPanel.hide();

    this.lootPanel = new LootPanel(
      this,
      this.layout.lootPanel.x,
      this.layout.lootPanel.y,
      this.lootSystem,
      this.inventorySystem,
      this.inventoryPanel,
    );
    this.lootPanel.hide();

    this.processPanel = new ProcessPanel(
      this,
      this.layout.processPanel.x,
      this.layout.processPanel.y,
      null,
    );
    this.processPanel.hide();

    this.gamePanel = new GamePanel(
      this,
      this.layout.gamePanel.x,
      this.layout.gamePanel.y,
      {
        onButton1Click: () => this.inventoryPanel.show(),
        onButton2Click: () => this.equipmentPanel.show(),
        onButton3Click: () => this.playerPanel.show(),
        onButton4Click: () => {
          // not implemented yet
        },
        onButton5Click: () => this.vitaPanel.show(),
        onButton6Click: () => {
          // not implemented yet
        },
        onButton7Click: () => {
          // not implemented yet
        },
      },
    );
  }

  connectGameplay() {
    this.syphonSystem = new SyphonSystem(this, {
      eventBus: this.eventBus,
      playerState: this.playerState,
      bonusSystem: this.bonusSystem,
    });

    this.combatSystem = new CombatSystem(this, {
      eventBus: this.eventBus,
      battlePanel: this.battlePanel,
      playerPanel: this.playerPanel,
      playerState: this.playerState,
      playerWorldState: this.playerWorldState,
      mapUI: this.mapUI,
      lootSystem: this.lootSystem,
      lootPanel: this.lootPanel,
      bonusSystem: this.bonusSystem,
      syphonSystem: this.syphonSystem,
    });

    this.gatheringSystem = new GatheringSystem(this, {
      eventBus: this.eventBus,
      playerState: this.playerState,
      playerWorldState: this.playerWorldState,
      inventorySystem: this.inventorySystem,
      inventoryPanel: this.inventoryPanel,
      activitySystem: this.activitySystem,
      mapUI: this.mapUI,
      gatherProgressUI: this.gatherProgressUI,
      bonusSystem: this.bonusSystem,
    });

    this.processingSystem = new ProcessingSystem(this, {
      eventBus: this.eventBus,
      playerState: this.playerState,
      playerWorldState: this.playerWorldState,
      inventorySystem: this.inventorySystem,
      inventoryPanel: this.inventoryPanel,
      activitySystem: this.activitySystem,
      mapUI: this.mapUI,
      processPanel: this.processPanel,
      bonusSystem: this.bonusSystem,
    });

    this.processPanel.processingSystem = this.processingSystem;
    //VITA PANEL HERE, NEEDS TO CREATE AFTER SYPHON SYSTEM
    this.vitaPanel = new VitaPanel(
      this,
      this.layout.vitaPanel.x,
      this.layout.vitaPanel.y,
      {
        playerState: this.playerState,
        syphonSystem: this.syphonSystem,
      },
    );
    this.vitaPanel.hide();
    //EQUIPMENT PANEL HERE, NEEDS TO CREATE AFTER SYPHONSYSTEM AND VITA PANEL
    this.equipmentPanel = new EquipmentPanel(
      this,
      this.layout.equipmentPanel.x,
      this.layout.equipmentPanel.y,
      {
        playerState: this.playerState,
        equipmentSystem: this.equipmentSystem,
        vitaPanel: this.vitaPanel,
      },
    );
    this.equipmentPanel.hide();

    this.uiSyncController = new UISyncController(this, {
      eventBus: this.eventBus,
      mapUI: this.mapUI,
      inventoryPanel: this.inventoryPanel,
      gatherProgressUI: this.gatherProgressUI,
      processPanel: this.processPanel,
      lootPanel: this.lootPanel,
      processingSystem: this.processingSystem,
      vitaPanel: this.vitaPanel,
      equipmentPanel: this.equipmentPanel,
    });

    this.uiSyncController.register();

    this.gameplayRequestRouter = new GameplayRequestRouter(this.eventBus, {
      mapUI: this.mapUI,
      combatSystem: this.combatSystem,
      gatheringSystem: this.gatheringSystem,
      processingSystem: this.processingSystem,
    });

    this.gameplayRequestRouter.register();
  }

  registerLifecycle() {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.destroyScene, this);
  }

  shutdown() {
    this.activitySystem?.cancelActivity?.("scene_shutdown");

    this.nodeInteractionSystem?.destroy?.();
    this.gameplayRequestRouter?.destroy?.();
    this.cursorManager?.destroy?.();
    this.uiSyncController?.destroy?.();
  }

  destroyScene() {
    this.processPanel?.destroy?.();
    this.inventoryPanel?.destroy?.();
    this.lootPanel?.destroy?.();
    this.battlePanel?.destroy?.();
    this.playerPanel?.destroy?.();
    this.mapUI?.destroy?.();
    this.gatherProgressUI?.destroy?.();
    this.uiSyncController?.destroy?.();
    this.vitaPanel?.destroy?.();
    this.equipmentPanel?.destroy?.();

    this.eventBus?.destroy?.();

    this.processPanel = null;
    this.inventoryPanel = null;
    this.lootPanel = null;
    this.battlePanel = null;
    this.playerPanel = null;
    this.mapUI = null;
    this.gatherProgressUI = null;
    this.uiSyncController = null;
    this.vitaPanel = null;
    this.equipmentPanel = null;

    this.cursorManager = null;
    this.nodeInteractionSystem = null;
    this.gameplayRequestRouter = null;
    this.combatSystem = null;
    this.gatheringSystem = null;
    this.processingSystem = null;
    this.activitySystem = null;
    this.inventorySystem = null;
    this.lootSystem = null;
    this.eventBus = null;
    this.playerState = null;
    this.playerWorldState = null;
  }

  update(_time, delta) {
    this.playerPanel?.update?.();
    this.battlePanel?.update?.();
    this.combatSystem?.update?.(delta);
    this.activitySystem?.update?.(delta);
    this.gatherProgressUI?.update?.();
    this.processingSystem?.update?.();
    this.eventBus?.process?.();
  }
}
