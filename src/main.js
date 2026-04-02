import Phaser from "phaser";
import BootScene from "./scenes/BootScene.js";
import GameScene from "./scenes/GameScene.js";
//#752438
const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "app",
  backgroundColor: "#111111",
  scene: [BootScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  //pixelArt: true,
  roundPixels: true
 

};

new Phaser.Game(config);