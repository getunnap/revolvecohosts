import type Stripe from "stripe";

/** Ensures Checkout mode matches the Stripe price type (one-time vs recurring). */
export async function validatePriceForCheckoutMode(
  stripe: Stripe,
  priceId: string,
  mode: "payment" | "subscription",
): Promise<{ ok: true } | { error: string }> {
  const price = await stripe.prices.retrieve(priceId);
  if (price.currency !== "gbp") {
    return { error: "Stripe price must use currency gbp." };
  }
  const isRecurring = Boolean(price.recurring);
  if (mode === "payment" && isRecurring) {
    return {
      error:
        "This Stripe price is for subscriptions only. Intro packs need a one-time GBP price (per intro, e.g. £20) as the product default, or use legacy pack price IDs.",
    };
  }
  if (mode === "subscription" && !isRecurring) {
    return {
      error:
        "This Stripe price is one-time. Monthly intro plans need a recurring GBP subscription price on the product.",
    };
  }
  return { ok: true };
}
