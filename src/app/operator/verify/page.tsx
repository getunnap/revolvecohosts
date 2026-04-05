import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import OperatorPortalShell from "@/components/operator/operator-portal-shell";
import { ensureOperatorProfileRow } from "@/lib/operator/ensure-operator-row";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import OperatorVerificationForm from "./operator-verification-form";

export const metadata: Metadata = {
  title: "Verification profile | Co-host portal",
  description:
    "Complete your co-host operator verification for Revolve: markets, listings managed, and portfolio proof.",
};

export default async function OperatorVerifyPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?as=cohost&next=${encodeURIComponent("/operator/verify")}`);
  }

  await ensureOperatorProfileRow(supabase, user);

  const { data: row } = await supabase
    .from("cohost_operators")
    .select(
      "status, full_name, phone, areas_served, listings_managed, portfolio_url, pitch",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row) {
    redirect("/operator");
  }

  if (row.status === "approved") {
    redirect("/operator");
  }

  if (row.status === "suspended") {
    redirect("/operator");
  }

  const initial = {
    fullName: row.full_name ?? "",
    phone: row.phone ?? "",
    areasServed: row.areas_served === "—" ? "" : (row.areas_served ?? ""),
    listingsManaged: row.listings_managed === "—" ? "" : (row.listings_managed ?? ""),
    portfolioUrl: row.portfolio_url ?? "",
    pitch: row.pitch ?? "",
  };

  return (
    <OperatorPortalShell email={user.email ?? ""}>
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/operator"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#059669] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to portal
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Verification profile
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          We use these details to approve your operator account and match you with hosts in the
          right markets. You can update them any time while your profile is under review.
        </p>

        <div className="mt-8 rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
          <OperatorVerificationForm initial={initial} />
        </div>
      </div>
    </OperatorPortalShell>
  );
}
