/**
 * Co-host operator intro pricing (GBP). Keep Stripe pack / subscription prices aligned.
 */
export const OPERATOR_FREE_INTRO_CREDITS = 2;

export const OPERATOR_INTRO_PRICE_GBP = 20;

export function operatorPackTotalGbp(introCount: number): number {
  return introCount * OPERATOR_INTRO_PRICE_GBP;
}

export function formatGbpWhole(amount: number): string {
  return `£${amount.toLocaleString("en-GB")}`;
}
