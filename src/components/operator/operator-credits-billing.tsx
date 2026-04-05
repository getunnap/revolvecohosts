import Link from "next/link";
import { CalendarClock, Coins, CreditCard, Zap } from "lucide-react";
import { formatBillDate, getNextMonthlyBillDate } from "@/lib/operator-billing-dates";
import type { CohostOperatorStatus } from "@/lib/operator/operator-verification";
import {
  formatGbpWhole,
  OPERATOR_FREE_INTRO_CREDITS,
  OPERATOR_INTRO_PRICE_GBP,
} from "@/lib/operator-intro-pricing";

export type OperatorMonthlyPlanSummary = {
  /** e.g. "Standard" */
  name: string;
  /** Credits included each month */
  creditsPerMonth: number;
} | null;

export default function OperatorCreditsBilling({
  creditsRemaining,
  monthlyPlan,
  accountState = "approved",
}: {
  creditsRemaining: number;
  monthlyPlan: OperatorMonthlyPlanSummary;
  accountState?: CohostOperatorStatus;
}) {
  const nextMonthly = getNextMonthlyBillDate();
  const nextMonthlyLabel = formatBillDate(nextMonthly);
  const canPurchase = accountState === "approved";

  const creditsSubtitle =
    accountState === "suspended"
      ? "Unavailable while your account is paused"
      : accountState === "pending_review"
        ? "Unlock for real intros once your profile is approved"
        : "Ready to use on intros";

  const planButtonClass =
    "inline-flex w-full items-center justify-center rounded-xl border-2 border-[#10B981]/40 bg-[#10B981]/5 px-5 py-3 text-sm font-semibold text-[#047857] transition-colors hover:bg-[#10B981]/10 sm:w-auto";
  const planButtonDisabledClass =
    "inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-5 py-3 text-sm font-semibold text-muted-foreground sm:w-auto";

  return (
    <div className="space-y-6">
      {/* Balance */}
      <section
        className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
        aria-labelledby="credits-balance-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10B981]/12">
                <Coins className="h-5 w-5 text-[#059669]" aria-hidden />
              </div>
              <h2 id="credits-balance-heading" className="text-lg font-semibold text-foreground">
                Intro credits
              </h2>
            </div>
            <p className="text-4xl font-bold tabular-nums text-foreground">{creditsRemaining}</p>
            <p className="mt-1 text-sm text-muted-foreground">{creditsSubtitle}</p>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">
              New operators get <strong className="font-medium text-foreground">{OPERATOR_FREE_INTRO_CREDITS} free intros</strong> to start. After that, each intro is{" "}
              <strong className="font-medium text-foreground">{formatGbpWhole(OPERATOR_INTRO_PRICE_GBP)}</strong> (packs or monthly plan).
            </p>
          </div>
          <Link
            href="/operator/billing#billing-overview"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted/50"
          >
            <CalendarClock className="h-4 w-4 text-[#059669]" aria-hidden />
            Billing and upcoming
          </Link>
        </div>
      </section>

      {/* Monthly plan — distinct from top-up */}
      <section
        className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
        aria-labelledby="monthly-plan-heading"
      >
        <div className="mb-3 flex items-center gap-2 text-[#059669]">
          <CreditCard className="h-5 w-5" aria-hidden />
          <h2 id="monthly-plan-heading" className="text-base font-semibold text-foreground">
            Your monthly plan
          </h2>
        </div>

        {monthlyPlan ? (
          <>
            <p className="text-lg font-semibold text-foreground">
              {monthlyPlan.name}{" "}
              <span className="font-normal text-muted-foreground">
                · {monthlyPlan.creditsPerMonth} credits / month
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Monthly plans are <strong className="font-medium text-foreground">charged on the 1st</strong>{" "}
              of each month. Your included credits are added on that cycle.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Next monthly bill:{" "}
              <strong className="font-medium text-foreground">{nextMonthlyLabel}</strong>
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">No monthly plan yet</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Subscribe to get a fixed number of intro credits every month. You are billed on the{" "}
              <strong className="font-medium text-foreground">1st of each month</strong>.
            </p>
          </>
        )}

        <div className="mt-5">
          {canPurchase ? (
            <Link href="/operator/billing#change-monthly-plan" className={planButtonClass}>
              {monthlyPlan ? "Change monthly plan" : "Choose a monthly plan"}
            </Link>
          ) : (
            <span className={planButtonDisabledClass}>
              {accountState === "suspended"
                ? "Plans unavailable"
                : "Plans available after approval"}
            </span>
          )}
        </div>
      </section>

      {/* Top-up — instant */}
      <section
        className="rounded-2xl border-2 border-dashed border-amber-200/90 bg-amber-50/40 p-6 dark:border-amber-900/50 dark:bg-amber-950/20"
        aria-labelledby="top-up-heading"
      >
        <div className="mb-2 flex items-center gap-2 text-amber-900 dark:text-amber-200">
          <Zap className="h-5 w-5" aria-hidden />
          <h2 id="top-up-heading" className="text-base font-semibold text-foreground">
            Top up credits
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Buy extra intro credits in a <strong className="font-medium text-foreground">one-off pack</strong>.
          Payment is taken <strong className="font-medium text-foreground">straight away</strong> at checkout
          — not on the 1st.
        </p>
        <div className="mt-5">
          {canPurchase ? (
            <Link
              href="/operator/billing#top-up-credits"
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#10B981] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#059669] sm:w-auto"
            >
              Top up now
            </Link>
          ) : (
            <span className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-dashed border-amber-300/80 bg-amber-50/50 px-5 py-3 text-sm font-semibold text-amber-900/80 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200/90 sm:w-auto">
              {accountState === "suspended"
                ? "Top-ups unavailable"
                : "Top up after approval"}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
