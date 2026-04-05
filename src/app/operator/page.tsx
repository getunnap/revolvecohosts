import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, Sparkles } from "lucide-react";
import OperatorCreditsBilling, {
  type OperatorMonthlyPlanSummary,
} from "@/components/operator/operator-credits-billing";
import OperatorPortalShell from "@/components/operator/operator-portal-shell";
import OperatorReviewStatusPanel from "@/components/operator/operator-review-status-panel";
import {
  formatGbpWhole,
  OPERATOR_FREE_INTRO_CREDITS,
  OPERATOR_INTRO_PRICE_GBP,
} from "@/lib/operator-intro-pricing";
import { ensureOperatorProfileRow } from "@/lib/operator/ensure-operator-row";
import { OPERATOR_DEMO_LEADS, OPERATOR_EXAMPLE_LEAD_ID } from "@/lib/operator-mock";
import {
  isOperatorVerificationProfileComplete,
  type CohostOperatorStatus,
} from "@/lib/operator/operator-verification";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Co-host portal",
  description: `Co-host operator portal: ${OPERATOR_FREE_INTRO_CREDITS} free intros when you join, then ${formatGbpWhole(OPERATOR_INTRO_PRICE_GBP)} per intro — monthly plan, top-ups, and matched leads.`,
};

export default async function OperatorPortalPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?as=cohost");
  }

  await ensureOperatorProfileRow(supabase, user);

  let creditsRemaining = 0;
  let monthlyPlan: OperatorMonthlyPlanSummary = null;

  const { data: cohostRow } = await supabase
    .from("cohost_operators")
    .select(
      "intro_credits_balance, status, areas_served, listings_managed",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const accountStatus = (cohostRow?.status ?? "pending_review") as CohostOperatorStatus;
  const profileComplete = isOperatorVerificationProfileComplete(
    cohostRow?.areas_served,
    cohostRow?.listings_managed,
  );
  const isApproved = accountStatus === "approved";

  if (cohostRow && typeof cohostRow.intro_credits_balance === "number") {
    creditsRemaining = cohostRow.intro_credits_balance;
  }

  type LiveIntro = {
    id: string;
    status: string;
    created_at: string;
    public_snapshot: Record<string, unknown> | null;
  };

  const { data: liveIntroRows, error: introsError } = await supabase
    .from("host_intro_requests")
    .select("id, status, created_at, public_snapshot")
    .eq("operator_user_id", user.id)
    .order("created_at", { ascending: false });

  const liveIntros = (liveIntroRows ?? []) as LiveIntro[];
  const introsSchemaMissing =
    introsError &&
    (String(introsError.message).toLowerCase().includes("relation") ||
      String(introsError.message).toLowerCase().includes("does not exist"));

  const liveInboxRows = liveIntros.map((row) => {
    const snap = row.public_snapshot ?? {};
    const hostLabel =
      typeof snap.hostLabel === "string" ? snap.hostLabel : "Host intro";
    const area = typeof snap.area === "string" ? snap.area : "—";
    const propertySummary =
      typeof snap.propertySummary === "string" ? snap.propertySummary : "—";
    const listingStage =
      typeof snap.listingStage === "string" ? snap.listingStage : "—";
    return {
      id: row.id,
      hostLabel,
      area,
      propertySummary,
      listingStage,
      status: row.status,
      receivedLabel: row.created_at
        ? new Date(row.created_at).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "—",
      isDemo: false as const,
    };
  });

  return (
    <OperatorPortalShell email={user.email ?? ""}>
      <div className="border-b border-border/80 bg-gradient-to-br from-[#10B981]/[0.07] via-background to-background px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-5xl">
          <div
            className={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
              isApproved
                ? "border-[#10B981]/35 bg-[#10B981]/10 text-[#047857]"
                : accountStatus === "suspended"
                  ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
                  : "border-amber-300/80 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {isApproved
              ? "Live — matched host intros and credits are active for your account"
              : accountStatus === "suspended"
                ? "Account paused — contact support to discuss next steps"
                : "Portal open — complete verification and wait for approval to receive live intros"}
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Co-host portal
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
            Your first {OPERATOR_FREE_INTRO_CREDITS} intros are free; after that{" "}
            {formatGbpWhole(OPERATOR_INTRO_PRICE_GBP)} per intro via packs or a monthly plan — plus
            top-ups any time and matched leads. Your Revolve operator home.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <OperatorReviewStatusPanel
          status={accountStatus}
          profileComplete={profileComplete}
        />

        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-start">
          <OperatorCreditsBilling
            creditsRemaining={creditsRemaining}
            monthlyPlan={monthlyPlan}
            accountState={accountStatus}
          />

          <section
            className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm lg:sticky lg:top-24"
            aria-labelledby="leads-overview-heading"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10B981]/12">
                <Inbox className="h-5 w-5 text-[#059669]" aria-hidden />
              </div>
              <h2 id="leads-overview-heading" className="text-lg font-semibold text-foreground">
                Matched leads
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isApproved
                ? "Intros appear here with host intent and property context from our tools and funnel. Open a row for full detail — reply to the host off-platform once introduced."
                : "After Revolve approves your profile, qualified host intros land here. You can explore the portal and billing pages in the meantime."}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Not on Revolve yet?{" "}
              <Link href="/cohosts" className="font-semibold text-[#059669] hover:underline">
                Apply as a co-host
              </Link>
            </p>
          </section>
        </div>

        <section className="mt-12" aria-labelledby="lead-list-heading">
          <h2 id="lead-list-heading" className="mb-4 text-lg font-semibold text-foreground">
            Inbox
          </h2>
          {introsSchemaMissing ? (
            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
              Live intro inbox is not connected yet. Sample data is shown below; real requests will
              appear here once your account is fully set up.
            </p>
          ) : null}
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
            <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-border/70 bg-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid-cols-[1.2fr_1fr_1fr_auto_auto]">
              <span>Host / area</span>
              <span className="hidden sm:inline">Property</span>
              <span className="hidden sm:inline">Stage</span>
              <span className="hidden text-center sm:inline">Status</span>
              <span className="text-right"> </span>
            </div>
            <ul className="divide-y divide-border/70">
              {liveInboxRows.length === 0 && !isApproved ? (
                <li className="px-4 py-10 text-center text-sm leading-relaxed text-muted-foreground">
                  {accountStatus === "suspended" ? (
                    <>
                      Inbox is unavailable while your account is paused. Email{" "}
                      <a
                        href="mailto:hello@revolvecohosts.com?subject=Co-host%20account"
                        className="font-semibold text-[#059669] underline-offset-2 hover:underline"
                      >
                        hello@revolvecohosts.com
                      </a>{" "}
                      to discuss reinstatement.
                    </>
                  ) : (
                    <>
                      No live intros yet. When your operator profile is approved, host requests that
                      match your coverage will show up here. Complete your{" "}
                      <Link
                        href="/operator/verify"
                        className="font-semibold text-[#059669] hover:underline"
                      >
                        verification profile
                      </Link>{" "}
                      if you have not already.
                    </>
                  )}
                </li>
              ) : liveInboxRows.length === 0 ? (
                <li>
                  <Link
                    href={`/operator/leads/${OPERATOR_EXAMPLE_LEAD_ID}`}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/25 sm:grid-cols-[1.2fr_1fr_1fr_auto_auto]"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {OPERATOR_DEMO_LEADS[0]?.hostLabel}
                      </p>
                      <p className="text-sm text-muted-foreground">{OPERATOR_DEMO_LEADS[0]?.area}</p>
                      <span className="mt-1 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                        Sample
                      </span>
                    </div>
                    <p className="hidden text-sm text-muted-foreground sm:block">
                      {OPERATOR_DEMO_LEADS[0]?.propertySummary}
                    </p>
                    <p className="hidden text-sm text-muted-foreground sm:block">
                      {OPERATOR_DEMO_LEADS[0]?.listingStage}
                    </p>
                    <span className="hidden text-center text-xs font-semibold text-muted-foreground sm:block">
                      —
                    </span>
                    <span className="text-sm font-semibold text-[#059669]">View</span>
                  </Link>
                </li>
              ) : (
                liveInboxRows.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      href={`/operator/leads/${lead.id}`}
                      className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/25 sm:grid-cols-[1.2fr_1fr_1fr_auto_auto]"
                    >
                      <div>
                        <p className="font-medium text-foreground">{lead.hostLabel}</p>
                        <p className="text-sm text-muted-foreground">{lead.area}</p>
                      </div>
                      <p className="hidden text-sm text-muted-foreground sm:block">
                        {lead.propertySummary}
                      </p>
                      <p className="hidden text-sm text-muted-foreground sm:block">
                        {lead.listingStage}
                      </p>
                      <span className="hidden text-center text-xs font-semibold capitalize text-[#059669] sm:block">
                        {lead.status}
                      </span>
                      <span className="text-sm font-semibold text-[#059669]">View</span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            <div className="border-t border-border/70 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
              {liveIntros.length > 0
                ? "Open a row to accept or decline. Accepting uses one intro credit."
                : isApproved
                  ? "Live host intros appear here after you run the intro-requests migration and a host submits a request."
                  : "Real host requests will list here once Revolve has approved your operator profile."}
            </div>
          </div>
        </section>
      </div>
    </OperatorPortalShell>
  );
}
