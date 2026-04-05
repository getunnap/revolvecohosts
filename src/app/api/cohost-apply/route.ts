import { serverErrorResponse } from "@/lib/api-error";
import {
  sendCohostApplyEmails,
  type CohostApplyPayload,
} from "@/lib/email/send-cohost-apply-email";
import { rateLimitCohostApply } from "@/lib/rate-limit/cohost-apply";
import { getClientIp } from "@/lib/rate-limit/free-report";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional(),
  areasServed: z.string().trim().min(2).max(2000),
  listingsManaged: z.string().trim().min(1).max(32),
  portfolioUrl: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === "") return undefined;
      return val;
    },
    z.string().trim().url().max(2000).optional(),
  ),
  pitch: z.string().trim().max(4000).optional(),
});

const NOTIFY_DEFAULT = "hello@revolvecohosts.com";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimitCohostApply(ip);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please check the form and try again.",
          details: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }

    const payload: CohostApplyPayload = {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone?.trim() ?? "",
      areasServed: parsed.data.areasServed,
      listingsManaged: parsed.data.listingsManaged,
      portfolioUrl: parsed.data.portfolioUrl?.trim() ?? "",
      pitch: parsed.data.pitch?.trim() ?? "",
    };

    const notifyTo =
      process.env.COHOST_APPLY_NOTIFY_EMAIL?.trim() || NOTIFY_DEFAULT;

    try {
      const admin = createAdminSupabaseClient();
      const { error: dbErr } = await admin.from("cohost_applications").insert({
        full_name: payload.fullName,
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone?.trim() || null,
        areas_served: payload.areasServed,
        listings_managed: payload.listingsManaged,
        portfolio_url: payload.portfolioUrl?.trim() || null,
        pitch: payload.pitch?.trim() || null,
        status: "submitted",
      });
      if (dbErr) {
        console.error("cohost_applications insert", dbErr);
      }
    } catch (e) {
      console.error("cohost_applications persist", e);
    }

    const sent = await sendCohostApplyEmails({ payload, notifyTo });
    if (!sent.ok) {
      if (process.env.NODE_ENV === "development") {
        console.info("[cohost-apply] Resend unavailable; payload:", payload);
        return NextResponse.json({ ok: true, dev: true });
      }
      return NextResponse.json(
        {
          error:
            "We could not send your application electronically. Please email hello@revolvecohosts.com with the same details.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return serverErrorResponse(500, "cohost-apply POST failed", e);
  }
}
