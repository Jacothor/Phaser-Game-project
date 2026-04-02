import { VITA_MAX_CHARGES } from "../../data/vitaData.js";

export function createEmptyVitaLedger() {
  return {};
}

export function getLedgerEntryKey(enemyType, tier) {
  return `${enemyType}::${tier}`;
}

export function ensureVitaLedgerEntry(ledger, enemyType, tier) {
  const key = getLedgerEntryKey(enemyType, tier);

  if (!ledger[key]) {
    ledger[key] = {
      enemyType,
      tier,
      charges: 0,
      maxCharges: VITA_MAX_CHARGES
    };
  }

  return ledger[key];
}

export function addVitaCharges(ledger, enemyType, tier, amount = 1) {
  const entry = ensureVitaLedgerEntry(ledger, enemyType, tier);
  entry.charges = Math.min(entry.maxCharges, entry.charges + amount);
  return entry;
}

export function removeVitaCharges(ledger, enemyType, tier, amount = 1) {
  const entry = ensureVitaLedgerEntry(ledger, enemyType, tier);

  if (entry.charges < amount) {
    return false;
  }

  entry.charges -= amount;
  return true;
}

export function getVitaCharges(ledger, enemyType, tier) {
  const entry = ensureVitaLedgerEntry(ledger, enemyType, tier);
  return entry.charges;
}