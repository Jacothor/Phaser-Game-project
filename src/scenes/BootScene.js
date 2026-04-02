import Phaser from "phaser";
import { CURSOR_THEMES, CURSOR_CONFIG } from "../data/cursorData";
import { PLAYER_ANIMATIONS, PLAYER_ASSETS } from "../data/playerPanelData";
import { ICONS } from "../data/iconsData";
import { FONTS } from "../data/fontData";
import { ENEMY_DATA } from "../data/enemiesData";
import { MAP_MUSIC, MAP_MUSIC_BASE_PATH } from "../data/musicData";
import { FX_ASSETS, FX_ANIMATIONS } from "../data/fxData";
import { MAP_ICON_PRELOAD } from "../data/map_icons_data";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }
  preload() {
    Object.values(CURSOR_THEMES).forEach((theme) => {
      this.load.spritesheet(theme.key, theme.path, {
        frameWidth: CURSOR_CONFIG.frameWidth,
        frameHeight: CURSOR_CONFIG.frameHeight,
      });
    });

    Object.values(PLAYER_ASSETS).forEach((stateAssets) => {
      stateAssets.forEach((asset) => {
        this.load.image(asset.key, asset.path);
      });
    });

    Object.values(ICONS).forEach((icon) => {
      this.load.image(icon.key, icon.path);
    });

    Object.values(FONTS).forEach((font) => {
      this.load.bitmapFont(font.key, font.path_png, font.path_xml);
    });

    //ENEMIES
    Object.values(ENEMY_DATA).forEach((enemy) => {
      this.load.spritesheet(enemy.ID, enemy.path, {
        frameWidth: enemy.frameWidth,
        frameHeight: enemy.frameHeight,
      });
    });

    Object.values(MAP_ICON_PRELOAD).forEach((icon) => {
      this.load.spritesheet(icon.ID, icon.path, {
        frameWidth: icon.frameWidth,
        frameHeight: icon.frameHeight
      });
    });

    Object.values(FX_ASSETS).forEach((fxGroup) => {
      fxGroup.forEach((asset) => {
        this.load.image(asset.key, asset.path);
      });
    });

    // MAP_MUSIC.forEach((track) => {
    //     this.load.audio(
    //         track.key,
    //         MAP_MUSIC_BASE_PATH + track.file
    //     );
    // });
    //TEST REMAKE FOR A AUTOMATED SYSTEM FOR ALL MAPS AND ICONS LATER
    this.load.image("sword", "assets/icons/icon_sword.png");
    this.load.image("merchant", "assets/icons/icon_money_bag.png");
    this.load.image("removeable", "assets/icons/icon_shovel.png");
    this.load.image("chest", "assets/icons/icon_chest.png");
    this.load.image("tree", "assets/icons/icon_tree.png");
    this.load.spritesheet("RPG", "assets/icons/Icons_RPG.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("TOOLS", "assets/icons/Icons_Tools_Crafting.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("ITEMS", "assets/items/32x32.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image("map_bg", "assets/maps/ascii_map.png");

    this.load.spritesheet(
      "gamepanel_buttons",
      "assets/ui/gamePanel_buttons.png",
      {
        frameWidth: 70,
        frameHeight: 83,
      },
    );
  }

  create() {
    Object.values(FX_ANIMATIONS).forEach((anim) => {
      this.anims.create({
        key: anim.key,
        frames: anim.frames.map((frameKey) => ({ key: frameKey })),
        frameRate: anim.frameRate,
        repeat: anim.repeat,
      });
    });

    Object.values(PLAYER_ANIMATIONS).forEach((anim) => {
      this.anims.create({
        key: anim.key,
        frames: anim.frames.map((frameKey) => ({ key: frameKey })),
        frameRate: anim.frameRate,
        repeat: anim.repeat,
      });

      this.createEnemyAnimations();
    });

    this.scene.start("GameScene");
  }
  createEnemyAnimations() {
    Object.values(ENEMY_DATA).forEach((enemy) => {
      Object.values(enemy.anims).forEach((anims) => {
        this.anims.create({
          key: `${enemy.ID}-${anims.key}`,
          frames: this.anims.generateFrameNumbers(enemy.ID, {
            start: anims.frameStart,
            end: anims.frameEnd,
          }),
          frameRate: anims.frameRate,
          repeat: anims.repeat,
        });
      });
    });
  }
}
