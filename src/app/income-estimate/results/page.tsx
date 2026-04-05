"use client";

import { MatchProfileCard } from "@/components/find-cohost/match-profile-card";
import { INCOME_ESTIMATE_RESULTS_KEY } from "@/lib/client-storage";
import type { IncomeEstimateResultsPayload, TwelveMonthIncomeEstimate } from "@/lib/income-estimate";
import { normalizeMatchCard, type MatchCard } from "@/lib/match-funnel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarRange, ChevronDown, Lightbulb, TrendingUp } from "lucide-react";

function formatGbp(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

function parseIncomeResultsPayload(raw: string): IncomeEstimateResultsPayload | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || !("matches" in data) || !("twelveMonth" in data)) {
      return null;
    }
    const p = data as IncomeEstimateResultsPayload;
    if (!Array.isArray(p.matches) || !p.twelveMonth) return null;
    return p;
  } catch {
    return null;
  }
}

function AnnualEstimateHero({ est }: { est: TwelveMonthIncomeEstimate }) {
  const [showMonthly, setShowMonthly] = useState(false);

  return (
    <div className="mb-10 overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/80 shadow-lg shadow-emerald-100/30 ring-1 ring-teal-100/50">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#10B981] text-white shadow-md">
            <TrendingUp className="h-6 w-6" strokeWidth={2.25} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800/90">
              {est.headline}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {formatGbp(est.annualLow)} – {formatGbp(est.annualHigh)}
              <span className="ml-1.5 text-base font-semibold text-zinc-500">/ year</span>
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              ~{formatGbp(est.annualMid)} mid-point · after your availability:{" "}
              <span className="font-medium text-teal-800">{est.availabilityLabel}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowMonthly((v) => !v)}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-900 shadow-sm transition-colors hover:bg-teal-50"
          aria-expanded={showMonthly}
        >
          {showMonthly ? "Hide monthly view" : "Monthly equivalent"}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showMonthly ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>
      {showMonthly && (
        <div className="border-t border-teal-100/90 bg-white/70 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-700">
            <CalendarRange className="h-4 w-4 text-teal-600" aria-hidden />
            <span>
              Adjusted monthly gross band:{" "}
              <span className="font-bold text-zinc-900">
                {formatGbp(est.monthlyLowAdjusted)} – {formatGbp(est.monthlyHighAdjusted)}
              </span>
              <span className="text-zinc-500"> (~{formatGbp(est.monthlyMidAdjusted)} mid)</span>
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">{est.disclaimer}</p>
        </div>
      )}
      {!showMonthly && (
        <p className="border-t border-teal-100/80 px-5 py-3 text-xs leading-relaxed text-zinc-500">
          {est.disclaimer}
        </p>
      )}
    </div>
  );
}

function ReasoningSection({ items }: { items: TwelveMonthIncomeEstimate["reasoning"] }) {
  return (
    <section
      className="mb-12 rounded-2xl border border-zinc-200/90 bg-white/90 p-5 shadow-sm sm:p-7"
      aria-labelledby="income-reasoning-heading"
    >
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
          <Lightbulb className="h-5 w-5" aria-hidden />
        </div>
        <h2 id="income-reasoning-heading" className="text-lg font-bold text-zinc-900">
          How we reasoned about this
        </h2>
      </div>
      <ul className="space-y-5">
        {items.map((item, i) => (
          <li key={i} className="border-l-2 border-[#10B981] pl-4">
            <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600">{item.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function IncomeEstimateResultsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchCard[] | null>(null);
  const [twelveMonth, setTwelveMonth] = useState<TwelveMonthIncomeEstimate | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(INCOME_ESTIMATE_RESULTS_KEY);
      if (!raw) {
        router.replace("/income-estimate");
        return;
      }
      const payload = parseIncomeResultsPayload(raw);
      if (!payload || payload.matches.length === 0) {
        router.replace("/income-estimate");
        return;
      }
      setMatches(payload.matches.map(normalizeMatchCard));
      setTwelveMonth(payload.twelveMonth);
    } catch {
      router.replace("/income-estimate");
    }
  }, [router]);

  if (!matches || !twelveMonth) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-gradient-to-br from-[#FFF5F3] to-[#EEF6FF] text-teal-700">
        Loading your estimate…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F3] via-[#F8F5FF] to-[#E8F7F2] pb-16 pt-6 sm:pt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="mb-6 text-center text-sm font-medium leading-relaxed text-zinc-700">
          <span className="bg-gradient-to-r from-[#FF385C] to-teal-600 bg-clip-text font-bold text-transparent">
            Your 12-month income picture
          </span>
          {" — "}
          indicative gross bookings from your details and typical market bands, then three co-hosts
          picked the same way as matchmaking.
        </p>

        <AnnualEstimateHero est={twelveMonth} />

        <ReasoningSection items={twelveMonth.reasoning} />

        <h2 className="mb-6 text-center text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
          Recommended co-hosts for your property
        </h2>
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
          <span className="mx-2 text-rose-200">·</span>
          <Link
            href="/find-cohost"
            className="text-teal-700 underline-offset-4 hover:underline"
          >
            Full matchmaking funnel
          </Link>
        </p>
      </div>
    </div>
  );
}
