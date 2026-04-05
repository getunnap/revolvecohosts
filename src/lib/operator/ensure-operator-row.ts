import { OPERATOR_FREE_INTRO_CREDITS } from "@/lib/operator-intro-pricing";
import { readPortalIntentFromMetadata } from "@/lib/revolve-portal";
import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Ensures the signed-in user has a cohost_operators row (RLS: insert own user_id).
 * Only creates a row for users who signed up / tagged as co-host (metadata), so host
 * accounts are not upgraded implicitly by visiting /operator.
 */
export async function ensureOperatorProfileRow(
  supabase: SupabaseClient,
  user: User,
): Promise<void> {
  const { data: existing } = await supabase
    .from("cohost_operators")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return;

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (readPortalIntentFromMetadata(meta) !== "cohost") {
    return;
  }

  const email = (user.email ?? "").trim().toLowerCase();
  if (!email) return;

  const fromMeta =
    typeof meta?.full_name === "string" && meta.full_name.trim()
      ? meta.full_name.trim()
      : null;
  const fullName = fromMeta ?? email.split("@")[0] ?? "Operator";

  const { error } = await supabase.from("cohost_operators").insert({
    user_id: user.id,
    email,
    full_name: fullName,
    areas_served: "—",
    listings_managed: "—",
    status: "pending_review",
    intro_credits_balance: OPERATOR_FREE_INTRO_CREDITS,
  });

  if (error) {
    console.error("ensureOperatorProfileRow insert", error);
  }
}
