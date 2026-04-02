import DraggablePanel from "./DraggablePanel.js";
import { addText } from "../utils/addText.js";
import { getVitaDef } from "../data/vitaData.js";
import { getSortedVitaLedgerEntries } from "../systems/vita/getSortedVitaLedgerEntries.js";

const TEXT_COLOR = 0xffffff;
const MUTED_TEXT_COLOR = 0xb8b8b8;
const OK_TEXT_COLOR = 0x7cff7c;
const BORDER_COLOR = 0x752438;

export default class VitaPanel extends DraggablePanel {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 420, 360, {
      depth: 5300
    });

    this.scene = scene;
    this.playerState = config.playerState ?? null;
    this.syphonSystem = config.syphonSystem ?? null;

    this.selectedTier = 1;
    this.selectedEntryKey = null;

    this.rowObjects = [];
    this.detailObjects = [];
    this.tierButtonObjects = [];

    this.layout = {
      titleY: -155,

      tierRowY: -128,
      tierButtonStartX: -175,
      tierButtonWidth: 32,
      tierButtonHeight: 24,
      tierButtonGap: 6,

      listX: -190,
      listY: -95,
      listWidth: 165,
      listRowHeight: 36,

      detailsX: -10,
      detailsY: -95,
      detailsWidth: 185,
      detailsHeight: 170,

      consumeButtonX: 40,
      consumeButtonY: 96,
      consumeButtonWidth: 120,
      consumeButtonHeight: 28
    };

    this.titleText = addText(this.scene, {
      x: 0,
      y: this.layout.titleY,
      text: "Vita",
      size: 20,
      color: TEXT_COLOR,
      originX: 0.5,
      originY: 0.5
    });

    this.listBg = this.scene.add.rectangle(
      this.layout.listX,
      this.layout.listY,
      this.layout.listWidth,
      220,
      0x111111
    );
    this.listBg.setOrigin(0, 0);
    this.listBg.setStrokeStyle(1, BORDER_COLOR);

    this.detailsBg = this.scene.add.rectangle(
      this.layout.detailsX,
      this.layout.detailsY,
      this.layout.detailsWidth,
      this.layout.detailsHeight,
      0x111111
    );
    this.detailsBg.setOrigin(0, 0);
    this.detailsBg.setStrokeStyle(1, BORDER_COLOR);

    this.consumeButton = this.scene.add.rectangle(
      this.layout.consumeButtonX,
      this.layout.consumeButtonY,
      this.layout.consumeButtonWidth,
      this.layout.consumeButtonHeight,
      0x000000
    );
    this.consumeButton.setOrigin(0, 0);
    this.consumeButton.setStrokeStyle(1, BORDER_COLOR);
    this.consumeButton.setInteractive();

    this.consumeButtonText = addText(this.scene, {
      x: this.layout.consumeButtonX + this.layout.consumeButtonWidth / 2,
      y: this.layout.consumeButtonY + this.layout.consumeButtonHeight / 2,
      text: "Consume 1",
      size: 14,
      color: TEXT_COLOR,
      originX: 0.5,
      originY: 0.5
    });

    this.consumeButton.on("pointerdown", () => {
      this.consumeSelectedCharge(1);
    });

    this.consumeButton.on("pointerover", () => {
      this.scene.cursorManager?.setState?.("pointer");
    });

    this.consumeButton.on("pointerout", () => {
      this.scene.cursorManager?.setState?.("default");
    });

    this.addBlockInteractionObject(this.consumeButton);

    this.addMany([
      this.titleText,
      this.listBg,
      this.detailsBg,
      this.consumeButton,
      this.consumeButtonText
    ]);

    this.createTierButtons();
    this.refresh();
    this.hide();
  }

  createTierButtons() {
    for (let i = 1; i <= 10; i++) {
      const x =
        this.layout.tierButtonStartX +
        (i - 1) * (this.layout.tierButtonWidth + this.layout.tierButtonGap);

      const bg = this.scene.add.rectangle(
        x,
        this.layout.tierRowY,
        this.layout.tierButtonWidth,
        this.layout.tierButtonHeight,
        i === this.selectedTier ? 0x2a1a1a : 0x000000
      );
      bg.setOrigin(0, 0);
      bg.setStrokeStyle(1, i === this.selectedTier ? 0xffd166 : BORDER_COLOR);
      bg.setInteractive();

      const txt = addText(this.scene, {
        x: x + this.layout.tierButtonWidth / 2,
        y: this.layout.tierRowY + this.layout.tierButtonHeight / 2,
        text: String(i),
        size: 12,
        color: TEXT_COLOR,
        originX: 0.5,
        originY: 0.5
      });

      bg.on("pointerdown", () => {
        this.selectedTier = i;
        this.selectedEntryKey = null;
        this.refresh();
      });

      bg.on("pointerover", () => {
        this.scene.cursorManager?.setState?.("pointer");
      });

      bg.on("pointerout", () => {
        this.scene.cursorManager?.setState?.("default");
      });

      this.add(bg);
      this.add(txt);
      this.addBlockInteractionObject(bg);

      this.tierButtonObjects.push({ bg, txt, tier: i });
    }
  }

  getLedgerEntriesForSelectedTier() {
    const ledger = this.playerState?.getVitaLedger?.() ?? {};
    return getSortedVitaLedgerEntries(ledger).filter(
      (entry) => entry.tier === this.selectedTier
    );
  }

  makeEntryKey(entry) {
    return `${entry.enemyType}::${entry.tier}`;
  }

  getSelectedEntry() {
    const entries = this.getLedgerEntriesForSelectedTier();
    return entries.find((entry) => this.makeEntryKey(entry) === this.selectedEntryKey) ?? null;
  }

  refresh() {
    this.refreshTierButtons();
    this.refreshList();
    this.refreshDetails();
    this.refreshConsumeButton();
  }

  refreshTierButtons() {
    for (const obj of this.tierButtonObjects) {
      const selected = obj.tier === this.selectedTier;
      obj.bg.setFillStyle(selected ? 0x2a1a1a : 0x000000);
      obj.bg.setStrokeStyle(1, selected ? 0xffd166 : BORDER_COLOR);
    }
  }

  clearRows() {
    this.rowObjects.forEach((obj) => obj.destroy());
    this.rowObjects = [];
  }

  refreshList() {
    this.clearRows();

    const entries = this.getLedgerEntriesForSelectedTier();

    if (
      this.selectedEntryKey &&
      !entries.some((entry) => this.makeEntryKey(entry) === this.selectedEntryKey)
    ) {
      this.selectedEntryKey = null;
    }

    entries.forEach((entry, index) => {
      const key = this.makeEntryKey(entry);
      const selected = key === this.selectedEntryKey;

      const y = this.layout.listY + 4 + index * this.layout.listRowHeight;

      const rowBg = this.scene.add.rectangle(
        this.layout.listX + 4,
        y,
        this.layout.listWidth - 8,
        this.layout.listRowHeight - 4,
        selected ? 0x2a1a1a : 0x000000
      );
      rowBg.setOrigin(0, 0);
      rowBg.setStrokeStyle(1, selected ? 0xffd166 : BORDER_COLOR);
      rowBg.setInteractive();

      const vitaDef = getVitaDef(entry.enemyType);
      const nameText = addText(this.scene, {
        x: this.layout.listX + 10,
        y: y + 6,
        text: vitaDef?.displayName ?? entry.enemyType,
        size: 12,
        color: TEXT_COLOR,
        originX: 0,
        originY: 0
      });

      const amountText = addText(this.scene, {
        x: this.layout.listX + 10,
        y: y + 20,
        text: `${entry.charges}/${entry.maxCharges}`,
        size: 11,
        color: entry.charges > 0 ? OK_TEXT_COLOR : MUTED_TEXT_COLOR,
        originX: 0,
        originY: 0
      });

      rowBg.on("pointerdown", () => {
        this.selectedEntryKey = key;
        this.refresh();
      });

      rowBg.on("pointerover", () => {
        this.scene.cursorManager?.setState?.("pointer");
      });

      rowBg.on("pointerout", () => {
        this.scene.cursorManager?.setState?.("default");
      });

      this.add(rowBg);
      this.add(nameText);
      this.add(amountText);
      this.addBlockInteractionObject(rowBg);

      this.rowObjects.push(rowBg, nameText, amountText);
    });
  }

  clearDetails() {
    this.detailObjects.forEach((obj) => obj.destroy());
    this.detailObjects = [];
  }

  refreshDetails() {
    this.clearDetails();

    const entry = this.getSelectedEntry();

    if (!entry) {
      const txt = addText(this.scene, {
        x: this.layout.detailsX + 8,
        y: this.layout.detailsY + 8,
        text: "Select Vita",
        size: 14,
        color: MUTED_TEXT_COLOR,
        originX: 0,
        originY: 0
      });

      this.add(txt);
      this.detailObjects.push(txt);
      return;
    }

    const vitaDef = getVitaDef(entry.enemyType);
    const tierDef = vitaDef?.tiers?.[entry.tier] ?? null;

    let y = this.layout.detailsY + 8;

    const title = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: vitaDef?.displayName ?? entry.enemyType,
      size: 14,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(title);
    this.detailObjects.push(title);

    y += 18;

    const tierText = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: `Tier ${entry.tier}`,
      size: 12,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(tierText);
    this.detailObjects.push(tierText);

    y += 18;

    const chargesText = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: `Charges ${entry.charges}/${entry.maxCharges}`,
      size: 12,
      color: entry.charges > 0 ? OK_TEXT_COLOR : MUTED_TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(chargesText);
    this.detailObjects.push(chargesText);

    y += 24;

    const effectsLabel = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: "Per charge",
      size: 12,
      color: TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(effectsLabel);
    this.detailObjects.push(effectsLabel);

    y += 18;

    const perChargeBonuses = tierDef?.perChargeBonuses ?? [];
    if (perChargeBonuses.length === 0) {
      const none = addText(this.scene, {
        x: this.layout.detailsX + 8,
        y,
        text: "No data",
        size: 11,
        color: MUTED_TEXT_COLOR,
        originX: 0,
        originY: 0
      });
      this.add(none);
      this.detailObjects.push(none);
      y += 16;
    } else {
      for (const bonus of perChargeBonuses) {
        const line = addText(this.scene, {
          x: this.layout.detailsX + 8,
          y,
          text: this.formatPerChargeBonus(bonus),
          size: 11,
          color: TEXT_COLOR,
          originX: 0,
          originY: 0
        });
        this.add(line);
        this.detailObjects.push(line);
        y += 16;
      }
    }

    y += 10;

    const xpText = addText(this.scene, {
      x: this.layout.detailsX + 8,
      y,
      text: `Consume 1 = ${this.syphonSystem?.getXpPerChargeForTier?.(entry.tier) ?? entry.tier} Syphoning XP`,
      size: 11,
      color: OK_TEXT_COLOR,
      originX: 0,
      originY: 0
    });
    this.add(xpText);
    this.detailObjects.push(xpText);
  }

  formatPerChargeBonus(bonus) {
    if (!bonus) {
      return "Unknown";
    }

    if (bonus.type === "stat") {
      return `${bonus.stat} +${bonus.valuePerCharge}/charge`;
    }

    if (bonus.type === "conversion") {
      return `${bonus.effectType} +${bonus.valuePerCharge}/charge`;
    }

    if (bonus.type === "trigger") {
      return `${bonus.trigger}`;
    }

    return "Unknown";
  }

  refreshConsumeButton() {
    const entry = this.getSelectedEntry();
    const enabled = !!entry && entry.charges > 0;

    this.consumeButton.setFillStyle(enabled ? 0x000000 : 0x222222);
    this.consumeButtonText.setTint(enabled ? TEXT_COLOR : MUTED_TEXT_COLOR);

    if (enabled) {
      this.consumeButton.setInteractive();
    } else {
      this.consumeButton.disableInteractive();
    }
  }

  consumeSelectedCharge(amount = 1) {
    const entry = this.getSelectedEntry();
    if (!entry || !this.syphonSystem) {
      return;
    }

    const result = this.syphonSystem.consumeVitaChargesForSyphonXp(
      entry.enemyType,
      entry.tier,
      amount
    );

    if (!result?.ok) {
      return;
    }

    this.refresh();
  }
}