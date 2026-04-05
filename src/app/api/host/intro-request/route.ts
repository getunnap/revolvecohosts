import { serverErrorResponse } from "@/lib/api-error";
import { sendOperatorNewIntroEmail } from "@/lib/email/send-intro-emails";
import { buildIntroPublicSnapshot } from "@/lib/intro-requests/snapshot";
import { resolveOperatorForCatalogId } from "@/lib/intro-requests/resolve-operator";
import type { HostIntroRequestSourceTool } from "@/lib/intro-requests/types";
import { mergeFunnelAnswers } from "@/lib/match-funnel";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const sourceToolSchema = z.enum(["find_cohost", "income_estimate", "audit"]);

const funnelAnswersSchema = z
  .object({
    propertyAddress: z.string().max(2000).optional(),
    propertyAddressPlaceId: z.string().max(512).optional(),
    propertyType: z.enum(["flat", "house", "hmo_multi"]).optional(),
    bedroomCount: z.enum(["1", "2", "3", "4_plus"]).optional(),
    managementSituation: z.enum(["self", "cohost", "getting_started"]).optional(),
    primaryGoal: z.enum(["max_revenue", "hands_off", "better_reviews"]).optional(),
    estimatedMonthlyRevenueBand: z.enum(["zero_2_5k", "2_5k_5k", "over_5k"]).optional(),
    email: z.string().email().max(254).optional(),
  })
  .passthrough();

const bodySchema = z.object({
  catalogOperatorId: z.string().trim().min(1).max(64),
  hostRequestCohortId: z.string().uuid(),
  sourceTool: sourceToolSchema,
  funnelAnswers: funnelAnswersSchema,
  matchReason: z.string().trim().max(2000).optional(),
  phone: z.string().trim().max(40).optional(),
  listingUrl: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().trim().url().max(2000).optional(),
  ),
  hostNotes: z.string().trim().max(4000).optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Sign in to request an intro." }, { status: 401 });
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const operator = await resolveOperatorForCatalogId(body.catalogOperatorId);
    if (!operator) {
      return NextResponse.json(
        { error: "No approved co-host is available to receive this intro yet." },
        { status: 503 },
      );
    }

    const merged = mergeFunnelAnswers(body.funnelAnswers);
    if (!merged.propertyAddress?.trim() || merged.propertyAddress.trim().length < 8) {
      return NextResponse.json(
        { error: "Property location is required (at least 8 characters)." },
        { status: 400 },
      );
    }

    const publicSnapshot = buildIntroPublicSnapshot(body.funnelAnswers, {
      matchReason: body.matchReason,
      operatorDisplayName: operator.full_name,
    });

    const admin = createAdminSupabaseClient();

    const { data: introRow, error: introErr } = await admin
      .from("host_intro_requests")
      .insert({
        host_user_id: user.id,
        operator_id: operator.id,
        operator_user_id: operator.user_id,
        status: "pending",
        source_tool: body.sourceTool as HostIntroRequestSourceTool,
        host_request_cohort_id: body.hostRequestCohortId,
        catalog_match_id: body.catalogOperatorId,
        operator_display_name: operator.full_name,
        public_snapshot: publicSnapshot,
      })
      .select("id")
      .single();

    if (introErr || !introRow?.id) {
      console.error("host_intro_requests insert", introErr);
      return serverErrorResponse(500, "Could not save intro request.", introErr);
    }

    const introId = introRow.id as string;

    const { error: contactErr } = await admin.from("host_intro_request_contact").insert({
      intro_request_id: introId,
      host_email: user.email,
      host_phone: body.phone?.trim() || null,
      property_full_address: merged.propertyAddress.trim(),
      listing_url: body.listingUrl ?? null,
      host_notes: body.hostNotes?.trim() || null,
    });

    if (contactErr) {
      console.error("host_intro_request_contact insert", contactErr);
      await admin.from("host_intro_requests").delete().eq("id", introId);
      return serverErrorResponse(500, "Could not save contact details.", contactErr);
    }

    const emailResult = await sendOperatorNewIntroEmail({
      to: operator.email,
      operatorFirstName: operator.full_name,
      hostArea: publicSnapshot.area,
      introRequestId: introId,
    });
    if (!emailResult.ok) {
      console.warn("Operator intro email failed (intro still created)", emailResult.error);
    }

    return NextResponse.json({ ok: true, introRequestId: introId });
  } catch (e) {
    return serverErrorResponse(500, "Intro request failed.", e);
  }
}
