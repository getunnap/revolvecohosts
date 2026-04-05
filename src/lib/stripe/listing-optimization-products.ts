import type Stripe from "stripe";
import { resolveGbpPriceId } from "@/lib/stripe/resolve-gbp-price";

/**
 * Maps bundle size → Stripe product for listing optimisation (per-listing pricing).
 * Quantity on the line item is always the number of listings being purchased.
 */
export function listingOptimizationProductIdForQuantity(qty: number): string | null {
  const q = Math.floor(qty);
  if (q < 1) return null;
  const one = process.env.STRIPE_PRODUCT_LISTING_OPT_1_LISTING?.trim();
  const twoToFive = process.env.STRIPE_PRODUCT_LISTING_OPT_2_TO_5_LISTINGS?.trim();
  const sixToTen = process.env.STRIPE_PRODUCT_LISTING_OPT_6_TO_10_LISTINGS?.trim();
  const elevenPlus =
    process.env.STRIPE_PRODUCT_LISTING_OPT_11_PLUS_LISTINGS?.trim() || sixToTen;

  if (q === 1) return one || null;
  if (q >= 2 && q <= 5) return twoToFive || null;
  if (q >= 6 && q <= 10) return sixToTen || null;
  return elevenPlus || null;
}

export function listingOptimizationTiersConfigured(): boolean {
  const one = process.env.STRIPE_PRODUCT_LISTING_OPT_1_LISTING?.trim();
  const twoToFive = process.env.STRIPE_PRODUCT_LISTING_OPT_2_TO_5_LISTINGS?.trim();
  const sixToTen = process.env.STRIPE_PRODUCT_LISTING_OPT_6_TO_10_LISTINGS?.trim();
  const elevenPlus =
    process.env.STRIPE_PRODUCT_LISTING_OPT_11_PLUS_LISTINGS?.trim() || sixToTen;
  return Boolean(one && twoToFive && sixToTen && elevenPlus);
}

export async function buildListingOptimizationCatalogLineItems(
  stripe: Stripe,
  quantity: number,
): Promise<
  | { lineItems: Array<{ price: string; quantity: number }> }
  | { error: string }
> {
  const productId = listingOptimizationProductIdForQuantity(quantity);
  if (!productId) {
    return {
      error:
        "Listing optimisation Stripe products are not fully configured. Set STRIPE_PRODUCT_LISTING_OPT_* env vars.",
    };
  }

  const resolved = await resolveGbpPriceId(stripe, productId);
  if ("error" in resolved) {
    return { error: resolved.error };
  }

  return {
    lineItems: [{ price: resolved.priceId, quantity }],
  };
}
