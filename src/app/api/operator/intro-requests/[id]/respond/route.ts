import { serverErrorResponse } from "@/lib/api-error";
import {
  sendHostIntroAcceptedEmail,
  sendHostIntroDeclinedEmail,
} from "@/lib/email/send-intro-emails";
import { logIntroAcceptLedger } from "@/lib/operator/credits";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  action: z.enum(["accept", "decline"]),
});

type IntroRow = {
  id: string;
  host_user_id: string;
  operator_user_id: string;
  status: string;
  host_request_cohort_id: string;
  operator_display_name: string | null;
};

async function pendingSummaryForCohort(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  hostUserId: string,
  cohortId: string,
  excludeId: string,
): Promise<string | undefined> {
  const { data } = await admin
    .from("host_intro_requests")
    .select("id, status, operator_display_name")
    .eq("host_user_id", hostUserId)
    .eq("host_request_cohort_id", cohortId)
    .neq("id", excludeId);

  const rows = (data ?? []) as {
    id: string;
    status: string;
    operator_display_name: string | null;
  }[];
  const pending = rows.filter((r) => r.status === "pending");
  if (pending.length === 0) {
    return "You don’t have other pending intros from this batch — sign in to Revolve to see three fresh co-host recommendations.";
  }
  const names = pending
    .map((p) => p.operator_display_name)
    .filter((n): n is string => Boolean(n?.trim()));
  if (names.length === 0) {
    return "Other co-hosts you contacted are still reviewing your request.";
  }
  if (names.length === 1) {
    return `${names[0]} is still reviewing your request.`;
  }
  const last = names.pop();
  return `${names.join(", ")} and ${last} are still reviewing your request.`;
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id: introId } = await ctx.params;
    if (!introId) {
      return NextResponse.json({ error: "Missing intro id." }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to respond." }, { status: 401 });
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body." }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();

    const { data: intro, error: fetchErr } = await admin
      .from("host_intro_requests")
      .select(
        "id, host_user_id, operator_user_id, status, host_request_cohort_id, operator_display_name",
      )
      .eq("id", introId)
      .maybeSingle();

    if (fetchErr || !intro) {
      return NextResponse.json({ error: "Intro not found." }, { status: 404 });
    }

    const row = intro as IntroRow;
    if (row.operator_user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    if (row.status !== "pending") {
      return NextResponse.json(
        { error: "This intro was already responded to." },
        { status: 409 },
      );
    }

    if (parsed.data.action === "decline") {
      const { error: updErr } = await admin
        .from("host_intro_requests")
        .update({ status: "declined", responded_at: new Date().toISOString() })
        .eq("id", introId)
        .eq("status", "pending");

      if (updErr) {
        return serverErrorResponse(500, "Could not decline intro.", updErr);
      }

      const { data: contact } = await admin
        .from("host_intro_request_contact")
        .select("host_email")
        .eq("intro_request_id", introId)
        .maybeSingle();

      const hostEmail = (contact as { host_email?: string } | null)?.host_email;
      if (hostEmail) {
        const pending = await pendingSummaryForCohort(
          admin,
          row.host_user_id,
          row.host_request_cohort_id,
          introId,
        );
        await sendHostIntroDeclinedEmail({
          to: hostEmail,
          operatorDisplayName: row.operator_display_name ?? "This co-host",
          pendingSummary: pending,
        });
      }

      return NextResponse.json({ ok: true, status: "declined" });
    }

    // accept: charge one intro credit (optimistic lock on balance)
    const { data: opBefore } = await admin
      .from("cohost_operators")
      .select("intro_credits_balance")
      .eq("user_id", user.id)
      .maybeSingle();

    const balanceBefore =
      (opBefore as { intro_credits_balance?: number } | null)?.intro_credits_balance ?? 0;
    if (balanceBefore < 1) {
      return NextResponse.json(
        {
          error:
            "You need at least one intro credit to accept. Top up in billing, then try again.",
        },
        { status: 402 },
      );
    }

    const { data: creditAfter, error: decErr } = await admin
      .from("cohost_operators")
      .update({ intro_credits_balance: balanceBefore - 1 })
      .eq("user_id", user.id)
      .eq("intro_credits_balance", balanceBefore)
      .select("intro_credits_balance")
      .maybeSingle();

    if (decErr || !creditAfter) {
      return NextResponse.json(
        {
          error:
            "Could not use an intro credit (please refresh and try again).",
        },
        { status: 409 },
      );
    }

    const newBalance = (creditAfter as { intro_credits_balance: number }).intro_credits_balance;

    const { error: acceptErr } = await admin
      .from("host_intro_requests")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", introId)
      .eq("status", "pending");

    if (acceptErr) {
      await admin
        .from("cohost_operators")
        .update({ intro_credits_balance: balanceBefore })
        .eq("user_id", user.id);
      return serverErrorResponse(500, "Could not complete accept.", acceptErr);
    }

    await logIntroAcceptLedger({
      operatorUserId: user.id,
      introRequestId: introId,
    });

    const { data: contact } = await admin
      .from("host_intro_request_contact")
      .select("host_email")
      .eq("intro_request_id", introId)
      .maybeSingle();

    const { data: opProfile } = await admin
      .from("cohost_operators")
      .select("email, phone, full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const hostEmail = (contact as { host_email?: string } | null)?.host_email;
    const op = opProfile as { email?: string; phone?: string | null; full_name?: string } | null;

    if (hostEmail && op?.email) {
      await sendHostIntroAcceptedEmail({
        to: hostEmail,
        operatorDisplayName: row.operator_display_name ?? op.full_name ?? "Your co-host",
        operatorEmail: op.email,
        whatsappHint: op.phone ?? undefined,
      });
    }

    return NextResponse.json({
      ok: true,
      status: "accepted",
      creditsRemaining: newBalance,
    });
  } catch (e) {
    return serverErrorResponse(500, "Respond failed.", e);
  }
}
