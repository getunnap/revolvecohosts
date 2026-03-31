import { serverErrorResponse } from "@/lib/api-error";
import { sendFullReportsEmail } from "@/lib/email/send-full-report-email";
import { generateFullReport } from "@/lib/report-generator";
import { getStripe } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FullReport, ListingInput } from "@/lib/types";
import { NextResponse } from "next/server";
import { z } from "zod";

const guestListingSchema = z.object({
  listingUrl: z.string().url(),
  location: z.string().min(2),
  title: z.string().min(2),
  description: z.string().min(2),
  amenities: z.string().min(2),
  targetGuest: z.string().min(2),
});

const guestFullReportCacheSchema = z.object({
  entries: z.array(
    z.object({
      listingUrl: z.string(),
      fullReport: z.unknown(),
    }),
  ),
});

const schema = z.object({
  reportId: z.string().min(1),
  sessionId: z.string().min(1),
  listing: guestListingSchema.optional(),
});

function parseCachedGuestFull(
  raw: unknown,
): Array<{ listingUrl: string; fullReport: FullReport }> | null {
  const r = guestFullReportCacheSchema.safeParse(raw);
  if (!r.success || r.data.entries.length === 0) return null;
  return r.data.entries as Array<{ listingUrl: string; fullReport: FullReport }>;
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Missing report/session id." }, { status: 400 });
    }

    const isGuest = parsed.data.reportId.startsWith("guest_");
    if (isGuest) {
      const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);
      const isPaid = session.payment_status === "paid" || session.status === "complete";
      if (!isPaid || session.metadata?.reportId !== parsed.data.reportId) {
        return NextResponse.json(
          { error: "Guest payment verification failed." },
          { status: 402 },
        );
      }

      const admin = createAdminSupabaseClient();
      const intakeRes = await admin
        .from("guest_intakes")
        .select(
          "additional_listing_urls, email, full_report_emailed_at, full_report_json, listing_snapshot",
        )
        .eq("report_id", parsed.data.reportId)
        .maybeSingle();

      if (intakeRes.error) {
        console.error("guest_intakes load failed", intakeRes.error);
        return NextResponse.json(
          { error: "Could not load guest report." },
          { status: 500 },
        );
      }
      if (!intakeRes.data) {
        return NextResponse.json({ error: "Guest report not found." }, { status: 404 });
      }

      const cached = parseCachedGuestFull(intakeRes.data.full_report_json);
      if (cached) {
        return NextResponse.json({
          fullReport: cached[0].fullReport,
          fullReports: cached,
          emailSent: Boolean(intakeRes.data.full_report_emailed_at),
        });
      }

      const fromBody = parsed.data.listing
        ? guestListingSchema.safeParse(parsed.data.listing)
        : null;
      const fromSnapshot = guestListingSchema.safeParse(
        intakeRes.data.listing_snapshot,
      );
      const primary = fromBody?.success
        ? fromBody.data
        : fromSnapshot.success
          ? fromSnapshot.data
          : null;

      if (!primary) {
        return NextResponse.json(
          { error: "Missing guest listing details." },
          { status: 400 },
        );
      }

      let urlList = [primary.listingUrl];
      const extras = (intakeRes.data.additional_listing_urls ?? []) as
        | string[]
        | null;
      if (extras?.length) {
        urlList = [primary.listingUrl, ...extras];
      }

      const uniqueUrls = [...new Set(urlList.map((u) => u.trim()).filter(Boolean))];

      const inputs: ListingInput[] = uniqueUrls.map((listingUrl) => ({
        ...primary,
        listingUrl,
      }));

      const fullReports: Array<{ listingUrl: string; fullReport: FullReport }> =
        [];
      for (const listing of inputs) {
        fullReports.push({
          listingUrl: listing.listingUrl,
          fullReport: await generateFullReport(listing),
        });
      }

      const persist = await admin
        .from("guest_intakes")
        .update({
          full_report_json: { entries: fullReports },
          stripe_checkout_session_id: parsed.data.sessionId,
          paid_at: new Date().toISOString(),
        })
        .eq("report_id", parsed.data.reportId);
      if (persist.error) {
        console.error("guest_intakes full report persist failed", persist.error);
      }

      let emailSent = false;
      try {
        const already = intakeRes.data.full_report_emailed_at;
        const fromIntake = intakeRes.data.email?.trim() ?? "";
        const fromStripe =
          session.customer_email?.trim() ||
          (typeof session.customer_details?.email === "string"
            ? session.customer_details.email.trim()
            : "") ||
          "";
        const to = fromIntake || fromStripe;
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);

        if (valid && !already) {
          const result = await sendFullReportsEmail({
            to,
            entries: fullReports,
          });
          if (result.ok) {
            emailSent = true;
            await admin
              .from("guest_intakes")
              .update({
                full_report_emailed_at: new Date().toISOString(),
              })
              .eq("report_id", parsed.data.reportId);
          } else {
            console.error("Guest full report email failed", result.error);
          }
        }
      } catch (emailErr) {
        console.error("Guest full report email pipeline failed", emailErr);
      }

      return NextResponse.json({
        fullReport: fullReports[0]?.fullReport,
        fullReports,
        emailSent,
      });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const reportRes = await supabase
      .from("reports")
      .select(
        "id, user_id, listing_id, status, stripe_payment_status, stripe_checkout_session_id, full_report_json",
      )
      .eq("id", parsed.data.reportId)
      .eq("user_id", user.id)
      .single();

    if (reportRes.error || !reportRes.data) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    if (reportRes.data.full_report_json) {
      return NextResponse.json({
        fullReport: reportRes.data.full_report_json,
        emailSent: false,
      });
    }

    const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);
    const isPaid = session.payment_status === "paid" || session.status === "complete";
    const sessionReportId = session.metadata?.reportId;

    if (
      !isPaid ||
      session.client_reference_id !== user.id ||
      sessionReportId !== parsed.data.reportId
    ) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 402 });
    }

    const listingRes = await supabase
      .from("listings")
      .select("listing_url, location, title, description, amenities, target_guest")
      .eq("id", reportRes.data.listing_id)
      .eq("user_id", user.id)
      .single();

    if (listingRes.error || !listingRes.data) {
      return NextResponse.json(
        { error: "Listing data missing for this report." },
        { status: 404 },
      );
    }

    const listing: ListingInput = {
      listingUrl: listingRes.data.listing_url,
      location: listingRes.data.location,
      title: listingRes.data.title,
      description: listingRes.data.description,
      amenities: listingRes.data.amenities,
      targetGuest: listingRes.data.target_guest,
    };

    const fullReport = await generateFullReport(listing);

    await supabase
      .from("reports")
      .update({
        status: "ready_full",
        stripe_payment_status: "paid",
        full_report_json: fullReport,
        score: fullReport.score,
      })
      .eq("id", parsed.data.reportId)
      .eq("user_id", user.id);

    let emailSent = false;
    const addr = user.email?.trim();
    if (addr && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
      const result = await sendFullReportsEmail({
        to: addr,
        entries: [{ listingUrl: listing.listingUrl, fullReport }],
      });
      emailSent = result.ok;
      if (!result.ok) {
        console.error("Signed-in full report email failed", result.error);
      }
    }

    return NextResponse.json({ fullReport, emailSent });
  } catch (error) {
    return serverErrorResponse(500, "Failed to generate full report.", error);
  }
}
