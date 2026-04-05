import { ensureOperatorProfileRow } from "@/lib/operator/ensure-operator-row";
import { readPortalIntentFromMetadata } from "@/lib/revolve-portal";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Host accounts (revolve_portal=host) cannot use the co-host portal without an operator row.
 * Keeps parity with host dashboard gating.
 */
export default async function OperatorLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return children;
  }

  await ensureOperatorProfileRow(supabase, user);

  const { data: opRow } = await supabase
    .from("cohost_operators")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const intent = readPortalIntentFromMetadata(
    user.user_metadata as Record<string, unknown> | undefined,
  );

  if (!opRow && intent !== "cohost") {
    redirect("/dashboard");
  }

  return children;
}
