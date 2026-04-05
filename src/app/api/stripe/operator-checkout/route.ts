import { serverErrorResponse } from "@/lib/api-error";
import { operatorPackTotalGbp } from "@/lib/operator-intro-pricing";
import { getBaseUrl, getStripe } from "@/lib/stripe";
import { resolveGbpPriceId } from "@/lib/stripe/resolve-gbp-price";
import { validatePriceForCheckoutMode } from "@/lib/stripe/validate-price-mode";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

const bodySchema = z.union([
  z.object({
    packIntros: z.union([z.literal(5), z.literal(10), z.literal(25)]),
  }),
  z.object({
    flow: z.literal("subscription"),
    monthlyIntros: z.union([z.literal(5), z.literal(10), z.literal(25)]),
  }),
]);

function subscriptionProductEnv(monthly: 5 | 10 | 25): string | undefined {
  if (monthly === 5) {
    return process.env.STRIPE_PRODUCT_OPERATOR_SUBSCRIPTION_5_INTROS_MONTHLY?.trim();
  }
  if (monthly === 10) {
    return process.env.STRIPE_PRODUCT_OPERATOR_SUBSCRIPTION_10_INTROS_MONTHLY?.trim();
  }
  return process.env.STRIPE_PRODUCT_OPERATOR_SUBSCRIPTION_25_INTROS_MONTHLY?.trim();
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Sign in as a co-host first." }, { status: 401 });
    }

    const { data: operatorRow } = await supabase
      .from("cohost_operators")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (operatorRow?.status !== "approved") {
      return NextResponse.json(
        {
          error:
            "Complete your verification profile and wait for approval before purchasing intro credits.",
        },
        { status: 403 },
      );
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
    }

    const stripe = getStripe();

    if ("flow" in parsed.data && parsed.data.flow === "subscription") {
      const monthly = parsed.data.monthlyIntros;
      const productId = subscriptionProductEnv(monthly);
      if (!productId) {
        return NextResponse.json(
          {
            error:
              "Monthly plan Stripe product is not configured for this tier. Set STRIPE_PRODUCT_OPERATOR_SUBSCRIPTION_* env vars.",
          },
          { status: 500 },
        );
      }

      const resolved = await resolveGbpPriceId(stripe, productId);
      if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 500 });
      }

      const subPriceOk = await validatePriceForCheckoutMode(
        stripe,
        resolved.priceId,
        "subscription",
      );
      if ("error" in subPriceOk) {
        return NextResponse.json({ error: subPriceOk.error }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: user.email ?? undefined,
        line_items: [{ price: resolved.priceId, quantity: 1 }],
        success_url: `${getBaseUrl()}/operator/billing?checkout=success`,
        cancel_url: `${getBaseUrl()}/operator/billing?checkout=cancel`,
        client_reference_id: user.id,
        metadata: {
          revolve_purpose: "operator_intro_subscription",
          operator_user_id: user.id,
          intro_credits_per_period: String(monthly),
        },
        subscription_data: {
          metadata: {
            revolve_purpose: "operator_intro_subscription",
            operator_user_id: user.id,
            intro_credits_per_period: String(monthly),
          },
        },
      });

      if (!session.url) {
        return NextResponse.json({ error: "Checkout URL missing." }, { status: 500 });
      }
      return NextResponse.json({ url: session.url });
    }

    if (!("packIntros" in parsed.data)) {
      return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
    }
    const pack = parsed.data.packIntros;
    const oneOffProduct = process.env.STRIPE_PRODUCT_OPERATOR_INTRO_ONE_OFF?.trim();

    let priceId: string;
    let quantity: number;

    if (oneOffProduct) {
      const resolved = await resolveGbpPriceId(stripe, oneOffProduct);
      if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 500 });
      }
      const packPriceOk = await validatePriceForCheckoutMode(
        stripe,
        resolved.priceId,
        "payment",
      );
      if ("error" in packPriceOk) {
        return NextResponse.json({ error: packPriceOk.error }, { status: 400 });
      }
      priceId = resolved.priceId;
      quantity = pack;
    } else {
      const legacy =
        pack === 5
          ? process.env.STRIPE_PRICE_OPERATOR_PACK_5_INTROS?.trim()
          : pack === 10
            ? process.env.STRIPE_PRICE_OPERATOR_PACK_10_INTROS?.trim()
            : process.env.STRIPE_PRICE_OPERATOR_PACK_25_INTROS?.trim();
      if (!legacy) {
        return NextResponse.json(
          {
            error:
              pack === 25
                ? "Set STRIPE_PRODUCT_OPERATOR_INTRO_ONE_OFF or STRIPE_PRICE_OPERATOR_PACK_25_INTROS."
                : pack === 5
                  ? "Set STRIPE_PRICE_OPERATOR_PACK_5_INTROS or STRIPE_PRODUCT_OPERATOR_INTRO_ONE_OFF."
                  : "Set STRIPE_PRICE_OPERATOR_PACK_10_INTROS or STRIPE_PRODUCT_OPERATOR_INTRO_ONE_OFF.",
          },
          { status: 500 },
        );
      }
      const resolved = await resolveGbpPriceId(stripe, legacy);
      if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 500 });
      }
      const legacyOk = await validatePriceForCheckoutMode(
        stripe,
        resolved.priceId,
        "payment",
      );
      if ("error" in legacyOk) {
        return NextResponse.json({ error: legacyOk.error }, { status: 400 });
      }
      priceId = resolved.priceId;
      quantity = 1;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity }],
      success_url: `${getBaseUrl()}/operator/billing?checkout=success`,
      cancel_url: `${getBaseUrl()}/operator/billing?checkout=cancel`,
      client_reference_id: user.id,
      metadata: {
        revolve_purpose: "operator_intro_credits",
        operator_user_id: user.id,
        intro_credits: String(pack),
        pack_label: `${pack} intros (${operatorPackTotalGbp(pack)})`,
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout URL missing." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    if (e instanceof Stripe.errors.StripeInvalidRequestError) {
      return NextResponse.json(
        { error: e.message, code: e.code },
        { status: 400 },
      );
    }
    return serverErrorResponse(500, "Operator checkout failed.", e);
  }
}
