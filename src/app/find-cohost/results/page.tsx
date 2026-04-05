"use client";

import {
  MATCH_FUNNEL_ANSWERS_KEY,
  MATCH_RESULTS_KEY,
} from "@/lib/client-storage";
import { getOrCreateHostIntroCohortId } from "@/lib/host-intro-cohort";
import { MatchProfileCard } from "@/components/find-cohost/match-profile-card";
import {
  estimatePortfolioRevenue,
  mergeFunnelAnswers,
  normalizeMatchCard,
  parseMatchResultsPayload,
  type MatchCard,
  type MatchFunnelAnswers,
  type PortfolioRevenueEstimate,
} from "@/lib/match-funnel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";

function formatGbp(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

function RevenueEstimateBanner({ estimate }: { estimate: PortfolioRevenueEstimate }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const hasBreakdown = estimate.breakdown && estimate.breakdown.length > 0;

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 shadow-md shadow-emerald-100/25 ring-1 ring-teal-100/50">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#10B981] text-white shadow-sm">
            <TrendingUp className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800/90">
              {estimate.headline}
            </p>
            <p className="truncate text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
              {formatGbp(estimate.monthlyLow)} – {formatGbp(estimate.monthlyHigh)}
              <span className="ml-1 text-sm font-semibold text-zinc-500">/ mo</span>
            </p>
            <p className="text-xs text-zinc-500">~{formatGbp(estimate.monthlyMid)} mid</p>
          </div>
        </div>
        {hasBreakdown && (
          <button
            type="button"
            onClick={() => setShowBreakdown((v) => !v)}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-900 shadow-sm transition-colors hover:bg-teal-50"
            aria-expanded={showBreakdown}
          >
            {showBreakdown ? "Hide breakdown" : "How we calculated this"}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showBreakdown ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        )}
      </div>

      {showBreakdown && hasBreakdown && (
        <div className="border-t border-teal-100/90 bg-white/60 px-4 py-4">
          <p className="mb-4 text-sm font-medium leading-snug text-zinc-800">{estimate.modelSummary}</p>
          <ul className="space-y-4">
            {estimate.breakdown.map((item, i) => (
              <li
                key={i}
                className="border-l-2 border-[#10B981] pl-3"
              >
                <p className="text-sm font-semibold text-zinc-900">{item.label}</p>
                <p className="mt-0.5 text-sm text-teal-900/90">
                  <span className="font-medium text-zinc-600">Your answer: </span>
                  {item.yourAnswer}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-600">{item.applies}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">{estimate.disclaimer}</p>
        </div>
      )}
    </div>
  );
}

export default function MatchResultsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchCard[] | null>(null);
  const [revenueEstimate, setRevenueEstimate] = useState<PortfolioRevenueEstimate | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(MATCH_RESULTS_KEY);
      if (!raw) {
        router.replace("/find-cohost");
        return;
      }
      const { matches: rawList, revenueEstimate: fromPayload } = parseMatchResultsPayload(raw);
      if (rawList.length === 0) {
        router.replace("/find-cohost");
        return;
      }
      setMatches(rawList.map(normalizeMatchCard));

      let rev: PortfolioRevenueEstimate | null = null;
      const ansRaw = sessionStorage.getItem(MATCH_FUNNEL_ANSWERS_KEY);
      if (ansRaw) {
        try {
          const parsed = JSON.parse(ansRaw) as Partial<MatchFunnelAnswers>;
          rev = estimatePortfolioRevenue(mergeFunnelAnswers(parsed));
        } catch {
          rev = fromPayload;
        }
      } else {
        rev = fromPayload;
      }
      setRevenueEstimate(rev);
      getOrCreateHostIntroCohortId();
    } catch {
      router.replace("/find-cohost");
    }
  }, [router]);

  if (!matches) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-gradient-to-br from-[#FFF5F3] to-[#EEF6FF] text-teal-700">
        Loading matches…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F3] via-[#F8F5FF] to-[#E8F7F2] pb-16 pt-6 sm:pt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="mb-8 text-center text-sm font-medium leading-relaxed text-zinc-700">
          <span className="bg-gradient-to-r from-[#FF385C] to-teal-600 bg-clip-text font-bold text-transparent">
            Your top matches
          </span>
          {" — "}
          revenue band from your property answers + co-host matches below.
        </p>

        {revenueEstimate && <RevenueEstimateBanner estimate={revenueEstimate} />}

        <h1 className="sr-only">Co-host matches</h1>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:items-start">
          {matches.map((m, i) => (
            <li key={m.id}>
              <MatchProfileCard m={m} recommended={i === 1} />
            </li>
          ))}
        </ul>

        <p className="mt-12 text-center text-sm font-medium text-zinc-600">
          <Link
            href="/dashboard"
            className="text-teal-700 underline-offset-4 hover:underline"
          >
            Host dashboard
          </Link>
          <span className="mx-2 text-rose-200">·</span>
          <Link
            href="/host/intros"
            className="text-teal-700 underline-offset-4 hover:underline"
          >
            Track your intros
          </Link>
          <span className="mx-2 text-rose-200">·</span>
          <Link
            href="/"
            className="text-[#FF385C] underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
          <span className="mx-2 text-rose-200">·</span>
          <Link href="/audit" className="text-teal-700 underline-offset-4 hover:underline">
            Free listing audit
          </Link>
        </p>
      </div>
    </div>
  );
}
