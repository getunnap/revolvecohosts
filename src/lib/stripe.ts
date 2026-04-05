import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  const isSecret = key.startsWith("sk_");
  const isRestricted = key.startsWith("rk_");
  if (!isSecret && !isRestricted) {
    throw new Error(
      "STRIPE_SECRET_KEY must be a Stripe secret or restricted key: sk_test_… / sk_live_… (or rk_test_… / rk_live_…). " +
        "Do not use publishable keys (pk_), webhook secrets (whsec_), or keys from other products.",
    );
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, {
      apiVersion: "2026-03-25.dahlia",
    });
  }
  return stripeSingleton;
}

export function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "http://localhost:3000";
}
