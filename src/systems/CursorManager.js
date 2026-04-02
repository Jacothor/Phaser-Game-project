import { CURSOR_THEMES,CURSOR_STATES } from "../data/cursorData";

export default class CursorManager {
    constructor(scene) {
        this.scene = scene;
        this.sprite = null;

        this.currentTheme = 'white';
        this.currentState = 'default';
    }
    create() {
        this.scene.game.canvas.style.cursor = "none";

        const textureKey = CURSOR_THEMES[this.currentTheme].key;
        const frame = CURSOR_STATES[this.currentState];

        this.sprite = this.scene.add.sprite(0,0,textureKey,frame);
        this.sprite.setOrigin(0,0);
        this.sprite.setScrollFactor(0);
        this.sprite.setDepth(9999);
        //tweak a little for right pointer tip
        this.hotspotX = -8;
        this.hotspotY = -4;

        this.scene.input.on('pointermove', this.handlePointerMove,this);
    }
    handlePointerMove(pointer) {
        if(!this.sprite) return;
        this.sprite.setPosition(
            pointer.x + this.hotspotX,
            pointer.y + this.hotspotY);
    }
    setState(stateName) {
        if (!(stateName in CURSOR_STATES)) {
            console.warn(`Unknown cursor state: ${stateName}`);
            return;
        }

        this.currentState = stateName;
        this.updateVisual();
    }
    setTheme(themeName) {
        if (!(themeName in CURSOR_THEMES)) {
            console.warn(`Unknown cursor theme:${themeName}`);
            return;
        }

        this.currentTheme = themeName;
        this.updateVisual();
    }

    updateVisual() {
        if(!this.sprite) return;
        const textureKey = CURSOR_THEMES[this.currentTheme].key;
        const frame = CURSOR_STATES[this.currentState];

        this.sprite.setTexture(textureKey,frame);
    }

    destroy() {
        if(this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }

        this.scene.input.off('pointermove',this.handlePointerMove,this);
        this.scene.input.setDefaultCursor('default');
    }
}