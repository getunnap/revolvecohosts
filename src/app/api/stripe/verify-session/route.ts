import { getStripe } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Missing session id." }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);
    const isPaid =
      session.payment_status === "paid" || session.status === "complete";

    if (!isPaid) {
      return NextResponse.json({ paid: false }, { status: 402 });
    }

    const reportId = session.metadata?.reportId;
    if (!reportId) {
      return NextResponse.json(
        { error: "Missing report link in checkout session." },
        { status: 400 },
      );
    }

    const isGuest = session.metadata?.isGuest === "true";
    if (isGuest || reportId.startsWith("guest_")) {
      const customerEmail =
        session.customer_email?.trim() ||
        (typeof session.customer_details?.email === "string"
          ? session.customer_details.email.trim()
          : "") ||
        null;
      return NextResponse.json({
        paid: true,
        reportId,
        isGuest: true,
        customerEmail,
      });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    if (session.client_reference_id !== user.id) {
      return NextResponse.json({ error: "Payment does not match user." }, { status: 403 });
    }

    await supabase
      .from("reports")
      .update({ stripe_payment_status: "paid" })
      .eq("id", reportId)
      .eq("user_id", user.id);

    return NextResponse.json({ paid: true, reportId });
  } catch {
    return NextResponse.json(
      { error: "Failed to verify payment." },
      { status: 500 },
    );
  }
}
