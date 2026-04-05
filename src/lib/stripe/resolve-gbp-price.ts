import type Stripe from "stripe";

/**
 * Resolve a Checkout line_items price id from either a price_ id or a product_ id
 * (uses the product's default price; must be GBP).
 */
export async function resolveGbpPriceId(
  stripe: Stripe,
  priceOrProductId: string,
): Promise<{ priceId: string } | { error: string }> {
  const raw = priceOrProductId.trim();
  if (!raw) {
    return { error: "Missing Stripe price or product id." };
  }

  if (raw.startsWith("price_")) {
    return { priceId: raw };
  }

  if (!raw.startsWith("prod_")) {
    return { error: "Expected a Stripe price_ or prod_ id." };
  }

  const product = await stripe.products.retrieve(raw, {
    expand: ["default_price"],
  });
  const defaultPrice = product.default_price;
  if (!defaultPrice || typeof defaultPrice === "string") {
    return {
      error:
        "Stripe product needs a default price. Set one in Stripe Dashboard or use a price_ id.",
    };
  }
  if (defaultPrice.currency !== "gbp") {
    return { error: "Stripe default price for this product must be GBP." };
  }
  return { priceId: defaultPrice.id };
}
