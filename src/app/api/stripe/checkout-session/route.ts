import { serverErrorResponse } from "@/lib/api-error";
import { getBaseUrl, getStripe } from "@/lib/stripe";
import { reportUnitAmountPence } from "@/lib/pricing";
import {
  buildListingOptimizationCatalogLineItems,
  listingOptimizationTiersConfigured,
} from "@/lib/stripe/listing-optimization-products";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  reportId: z.string().min(1),
  isGuest: z.boolean().optional(),
  quantity: z.number().int().min(1).max(20).optional(),
  additionalListingUrls: z.array(z.string().url()).max(19).optional(),
});

export async function POST(request: Request) {
  const configuredPrice = process.env.STRIPE_PRICE_ONE_OFF_GBP_349?.trim();
  const useListingCatalog = listingOptimizationTiersConfigured();

  if (!process.env.STRIPE_SECRET_KEY || (!configuredPrice && !useListingCatalog)) {
    return NextResponse.json(
      { error: "Stripe is not fully configured." },
      { status: 500 },
    );
  }

  try {
    const stripe = getStripe();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout payload." }, { status: 400 });
    }

    const isGuestReport =
      parsed.data.isGuest === true || parsed.data.reportId.startsWith("guest_");

    const extras = (parsed.data.additionalListingUrls ?? []).filter(Boolean);
    const impliedQty = 1 + extras.length;
    const qty = Math.min(
      20,
      Math.max(1, parsed.data.quantity ?? impliedQty),
    );

    if (isGuestReport && qty !== impliedQty) {
      return NextResponse.json(
        {
          error:
            "Quantity must match your listings (1 primary + additional URLs).",
        },
        { status: 400 },
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userIdForSession: string | null = null;
    if (!isGuestReport) {
      if (!user) {
        return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
      }
      userIdForSession = user.id;

      const reportResult = await supabase
        .from("reports")
        .select("id, stripe_payment_status")
        .eq("id", parsed.data.reportId)
        .eq("user_id", user.id)
        .single();

      if (reportResult.error || !reportResult.data) {
        return NextResponse.json({ error: "Report not found." }, { status: 404 });
      }

      if (reportResult.data.stripe_payment_status === "paid") {
        return NextResponse.json(
          { error: "This report is already paid." },
          { status: 400 },
        );
      }
    } else {
      const admin = createAdminSupabaseClient();
      const intake = await admin
        .from("guest_intakes")
        .select("id")
        .eq("report_id", parsed.data.reportId)
        .maybeSingle();
      if (!intake.data) {
        return NextResponse.json(
          { error: "Guest report not found. Generate a free preview first." },
          { status: 404 },
        );
      }
      const updated = await admin
        .from("guest_intakes")
        .update({
          additional_listing_urls: extras.length ? extras : null,
          purchase_quantity: qty,
        })
        .eq("report_id", parsed.data.reportId);
      if (updated.error) {
        console.error("guest_intakes checkout prep failed", updated.error);
        return NextResponse.json(
          { error: "Could not prepare checkout." },
          { status: 500 },
        );
      }
    }

    let lineItems:
      | Array<{ price: string; quantity: number }>
      | Array<{
          price_data: {
            currency: string;
            unit_amount: number;
            product_data: { name: string; description?: string };
          };
          quantity: number;
        }>;

    let unitAmountPenceForResponse = reportUnitAmountPence(qty);

    if (useListingCatalog) {
      const built = await buildListingOptimizationCatalogLineItems(stripe, qty);
      if ("error" in built) {
        return NextResponse.json({ error: built.error }, { status: 500 });
      }
      lineItems = built.lineItems;
      const firstPriceId = built.lineItems[0]?.price;
      if (firstPriceId) {
        const price = await stripe.prices.retrieve(firstPriceId);
        if (typeof price.unit_amount === "number") {
          unitAmountPenceForResponse = price.unit_amount;
        }
      }
    } else if (!configuredPrice) {
      return NextResponse.json(
        { error: "Stripe listing price is not configured." },
        { status: 500 },
      );
    } else {
      const useStripePrice =
        !isGuestReport && qty === 1 && configuredPrice.startsWith("price_");

      if (useStripePrice) {
        lineItems = [{ price: configuredPrice, quantity: 1 }];
      } else if (!isGuestReport && qty === 1 && configuredPrice.startsWith("prod_")) {
        const product = await stripe.products.retrieve(configuredPrice, {
          expand: ["default_price"],
        });
        const defaultPrice = product.default_price;
        if (
          !defaultPrice ||
          typeof defaultPrice === "string" ||
          defaultPrice.currency !== "gbp"
        ) {
          return NextResponse.json(
            {
              error:
                "Stripe product must have a GBP default price. Set STRIPE_PRICE_ONE_OFF_GBP_349 to a Stripe price_ id instead.",
            },
            { status: 400 },
          );
        }
        lineItems = [{ price: defaultPrice.id, quantity: 1 }];
      } else if (!isGuestReport && qty === 1 && !configuredPrice.startsWith("price_")) {
        const parsedAmount = Number(configuredPrice.replace(/[^0-9.]/g, ""));
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
          return NextResponse.json(
            {
              error:
                "Invalid STRIPE_PRICE_ONE_OFF_GBP_349 value. Use a Stripe price_ id.",
            },
            { status: 400 },
          );
        }
        lineItems = [
          {
            price_data: {
              currency: "gbp",
              unit_amount: Math.round(parsedAmount * 100),
              product_data: {
                name: "Full Airbnb Listing Audit",
              },
            },
            quantity: 1,
          },
        ];
      } else {
        const unit = reportUnitAmountPence(qty);
        const tierLabel =
          qty >= 10
            ? "10+ listings tier"
            : qty >= 5
              ? "5-9 listings tier"
              : qty >= 3
                ? "3-4 listings tier"
                : "1-2 listings";
        lineItems = [
          {
            price_data: {
              currency: "gbp",
              unit_amount: unit,
              product_data: {
                name: `Full Airbnb listing audit × ${qty}`,
                description: `£${(unit / 100).toFixed(2)} per report — ${tierLabel}`,
              },
            },
            quantity: qty,
          },
        ];
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${getBaseUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBaseUrl()}/checkout/cancel`,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      client_reference_id: userIdForSession ?? undefined,
      metadata: {
        reportId: parsed.data.reportId,
        userId: userIdForSession ?? "",
        isGuest: isGuestReport ? "true" : "false",
        quantity: String(qty),
      },
    });

    if (isGuestReport) {
      const admin = createAdminSupabaseClient();
      const sessionWrite = await admin
        .from("guest_intakes")
        .update({ stripe_checkout_session_id: session.id })
        .eq("report_id", parsed.data.reportId);
      if (sessionWrite.error) {
        console.error("guest_intakes session id update failed", sessionWrite.error);
      }
    }

    if (!isGuestReport && userIdForSession) {
      await supabase
        .from("reports")
        .update({
          stripe_checkout_session_id: session.id,
          stripe_payment_status: "pending",
        })
        .eq("id", parsed.data.reportId)
        .eq("user_id", userIdForSession);
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      quantity: qty,
      unitAmountPence: unitAmountPenceForResponse,
    });
  } catch (error) {
    return serverErrorResponse(500, "Unable to create checkout session.", error);
  }
}
