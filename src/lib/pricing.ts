/**
 * Tiered GBP per-report pricing (pence) aligned with marketing copy:
 * 1–2 reports: £5.99, 3–4: £4.99, 5–9: £4.29, 10+: £3.99.
 */
export function reportUnitAmountPence(totalQuantity: number): number {
  const q = Math.floor(totalQuantity);
  if (q >= 10) return 399;
  if (q >= 5) return 429;
  if (q >= 3) return 499;
  return 599;
}

export function formatTierSummary(quantity: number): string {
  const unit = reportUnitAmountPence(quantity) / 100;
  return `£${unit.toFixed(2)} × ${quantity} listing${quantity === 1 ? "" : "s"}`;
}
