import { grantIntroCreditsFromStripeSession } from "@/lib/operator/credits";
import { getStripe } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret || !process.env.STRIPE_SECRET_KEY?.trim()) {
    return NextResponse.json(
      { error: "Missing webhook config." },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const rawBody = await request.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    const admin = createAdminSupabaseClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await admin
          .from("reports")
          .update({
            stripe_payment_status: "paid",
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
          })
          .eq("stripe_checkout_session_id", session.id);

        const meta = session.metadata ?? {};
        if (
          meta.revolve_purpose === "operator_intro_credits" &&
          session.payment_status === "paid" &&
          typeof meta.operator_user_id === "string" &&
          meta.operator_user_id.trim()
        ) {
          const credits = parseInt(String(meta.intro_credits ?? "0"), 10);
          if (Number.isFinite(credits) && credits > 0) {
            await grantIntroCreditsFromStripeSession({
              operatorUserId: meta.operator_user_id.trim(),
              credits,
              stripeCheckoutSessionId: session.id,
            });
          }
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.status !== "paid") break;
        const nested = invoice.parent?.subscription_details?.subscription;
        const subId =
          typeof nested === "string"
            ? nested
            : nested && typeof nested === "object" && "id" in nested
              ? nested.id
              : undefined;
        const snapshotMeta = invoice.parent?.subscription_details?.metadata ?? null;

        let sm: Stripe.Metadata = {};
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          sm = sub.metadata ?? {};
        } else if (snapshotMeta && typeof snapshotMeta === "object") {
          sm = snapshotMeta as Stripe.Metadata;
        } else {
          break;
        }
        if (
          sm.revolve_purpose === "operator_intro_subscription" &&
          typeof sm.operator_user_id === "string" &&
          sm.operator_user_id.trim()
        ) {
          const credits = parseInt(String(sm.intro_credits_per_period ?? "0"), 10);
          if (Number.isFinite(credits) && credits > 0) {
            await grantIntroCreditsFromStripeSession({
              operatorUserId: sm.operator_user_id.trim(),
              credits,
              stripeCheckoutSessionId: invoice.id,
            });
          }
        }

        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await admin
          .from("reports")
          .update({ stripe_payment_status: "failed" })
          .eq("stripe_payment_intent_id", intent.id);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await admin
          .from("reports")
          .update({ stripe_payment_status: "refunded" })
          .eq("stripe_charge_id", charge.id);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeSignatureVerificationError
        ? "Invalid webhook signature."
        : "Webhook handling failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
