import Phaser from "phaser";

export function addText(scene, {
  x = 0,
  y = 0,
  text = "",
  size = 12,
  font = "font01",
  color = 0xffffff,
  originX = 0,
  originY = 0,
  depth = 0
} = {}) {
  const bitmapText = scene.add.bitmapText(x, y, font, text, size);

  scene.textures.get(font).setFilter(Phaser.Textures.FilterMode.NEAREST);

  bitmapText.setTint(color);
  bitmapText.setOrigin(originX, originY);
  bitmapText.setDepth(depth);

  return bitmapText;
}