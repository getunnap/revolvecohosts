import { serverErrorResponse } from "@/lib/api-error";
import { sendFreeReportEmail } from "@/lib/email/send-free-report-email";
import {
  getClientIp,
  rateLimitFreeReport,
} from "@/lib/rate-limit/free-report";
import { generateFreeReport } from "@/lib/report-generator";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { ListingInput } from "@/lib/types";
import { NextResponse } from "next/server";
import { z } from "zod";

const listingSchema = z.object({
  listingUrl: z.string().url(),
  targetGuest: z.string().min(2),
  email: z.string().email(),
  location: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  amenities: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimitFreeReport(ip);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a few minutes." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limited.retryAfterSec),
          },
        },
      );
    }

    const admin = createAdminSupabaseClient();

    const body = (await request.json()) as ListingInput;
    const parsed = listingSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        {
          error: "Please provide all required listing details.",
          details,
        },
        { status: 400 },
      );
    }

    const listingInput: ListingInput = {
      listingUrl: parsed.data.listingUrl,
      targetGuest: parsed.data.targetGuest,
      location: parsed.data.location || "Not provided",
      title: parsed.data.title || "Not provided",
      description: parsed.data.description || "Not provided",
      amenities: parsed.data.amenities || "Not provided",
    };

    const freeReport = await generateFreeReport(listingInput);
    const guestReportId = `guest_${crypto.randomUUID()}`;
    const intakeInsert = await admin.from("guest_intakes").insert({
      listing_url: parsed.data.listingUrl,
      target_guest: parsed.data.targetGuest,
      report_id: guestReportId,
      email: parsed.data.email,
      listing_snapshot: {
        listingUrl: parsed.data.listingUrl,
        targetGuest: parsed.data.targetGuest,
        location: listingInput.location,
        title: listingInput.title,
        description: listingInput.description,
        amenities: listingInput.amenities,
      },
    });
    if (intakeInsert.error) {
      console.error("guest_intakes insert failed", intakeInsert.error);
    }

    let emailSent = false;
    const to = parsed.data.email.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      const result = await sendFreeReportEmail({
        to,
        listingUrl: parsed.data.listingUrl,
        report: freeReport,
      });
      if (result.ok) {
        emailSent = true;
      } else {
        console.error("Free report email failed", result.error);
      }
    }

    return NextResponse.json({
      freeReport,
      reportId: guestReportId,
      isGuest: true,
      intakeSaved: !intakeInsert.error,
      emailSent,
    });
  } catch (error) {
    return serverErrorResponse(
      500,
      "Failed to generate free report.",
      error,
    );
  }
}
