export function getSortedVitaLedgerEntries(vitaLedger = {}) {
  return Object.values(vitaLedger).sort((a, b) => {
    if (a.tier !== b.tier) {
      return a.tier - b.tier;
    }

    return a.enemyType.localeCompare(b.enemyType);
  });
}