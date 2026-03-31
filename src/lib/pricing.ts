/**
 * Tiered GBP per-report pricing (pence) aligned with marketing copy:
 * 1–2 reports: £3.49, 3–4: £2.99, 5–9: £2.69, 10+: £2.49.
 */
export function reportUnitAmountPence(totalQuantity: number): number {
  const q = Math.floor(totalQuantity);
  if (q >= 10) return 249;
  if (q >= 5) return 269;
  if (q >= 3) return 299;
  return 349;
}

export function formatTierSummary(quantity: number): string {
  const unit = reportUnitAmountPence(quantity) / 100;
  return `£${unit.toFixed(2)} × ${quantity} listing${quantity === 1 ? "" : "s"}`;
}
