import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type ResolvedOperator = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  intro_credits_balance: number;
};

/**
 * Prefer operator row tagged with catalog_match_id (e.g. mock-1 from mock match UI).
 * Optional fallback: set INTRO_RESOLVE_FALLBACK_FIRST_APPROVED=true (e.g. local dev with one seeded operator).
 */
export async function resolveOperatorForCatalogId(
  catalogMatchId: string,
): Promise<ResolvedOperator | null> {
  const admin = createAdminSupabaseClient();

  const { data: tagged } = await admin
    .from("cohost_operators")
    .select("id, user_id, full_name, email, intro_credits_balance, status")
    .eq("catalog_match_id", catalogMatchId)
    .eq("status", "approved")
    .maybeSingle();

  if (tagged && tagged.status === "approved") {
    return {
      id: tagged.id,
      user_id: tagged.user_id,
      full_name: tagged.full_name,
      email: tagged.email,
      intro_credits_balance: tagged.intro_credits_balance ?? 0,
    };
  }

  const allowFallback =
    process.env.INTRO_RESOLVE_FALLBACK_FIRST_APPROVED?.trim() === "true";
  if (!allowFallback) return null;

  const { data: fallback } = await admin
    .from("cohost_operators")
    .select("id, user_id, full_name, email, intro_credits_balance, status")
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!fallback || fallback.status !== "approved") return null;

  return {
    id: fallback.id,
    user_id: fallback.user_id,
    full_name: fallback.full_name,
    email: fallback.email,
    intro_credits_balance: fallback.intro_credits_balance ?? 0,
  };
}
