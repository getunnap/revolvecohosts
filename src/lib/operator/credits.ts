import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/** Idempotent Stripe pack grant: ledger row unique per checkout session + balance bump. */
export async function grantIntroCreditsFromStripeSession(params: {
  operatorUserId: string;
  credits: number;
  stripeCheckoutSessionId: string;
}): Promise<boolean> {
  const admin = createAdminSupabaseClient();

  const { data: dup } = await admin
    .from("operator_credit_ledger")
    .select("id")
    .eq("stripe_checkout_session_id", params.stripeCheckoutSessionId)
    .maybeSingle();

  if (dup) return true;

  const { error: ledErr } = await admin.from("operator_credit_ledger").insert({
    operator_user_id: params.operatorUserId,
    delta: params.credits,
    reason: "stripe_pack",
    stripe_checkout_session_id: params.stripeCheckoutSessionId,
  });

  if (ledErr) {
    console.error("operator_credit_ledger grant insert", ledErr);
    return false;
  }

  const { data: op } = await admin
    .from("cohost_operators")
    .select("intro_credits_balance")
    .eq("user_id", params.operatorUserId)
    .maybeSingle();

  const bal = (op as { intro_credits_balance?: number } | null)?.intro_credits_balance ?? 0;

  const { error: upErr } = await admin
    .from("cohost_operators")
    .update({ intro_credits_balance: bal + params.credits })
    .eq("user_id", params.operatorUserId);

  if (upErr) {
    console.error("cohost_operators grant balance update", upErr);
    return false;
  }

  return true;
}

export async function logIntroAcceptLedger(params: {
  operatorUserId: string;
  introRequestId: string;
}): Promise<void> {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("operator_credit_ledger").insert({
    operator_user_id: params.operatorUserId,
    delta: -1,
    reason: "intro_accept",
    intro_request_id: params.introRequestId,
    stripe_checkout_session_id: null,
  });
  if (error) {
    console.warn("operator_credit_ledger intro_accept (optional table)", error.message);
  }
}
