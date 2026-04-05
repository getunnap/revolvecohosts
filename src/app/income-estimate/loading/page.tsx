"use client";

import {
  clearMockExcludedCatalogIds,
  INCOME_ESTIMATE_ANSWERS_KEY,
  INCOME_ESTIMATE_RESULTS_KEY,
  MATCH_RESULTS_KEY,
  readMockExcludedCatalogIds,
} from "@/lib/client-storage";
import {
  estimateTwelveMonthIncome,
  incomeAnswersToMatchFunnel,
  mergeIncomeEstimateAnswers,
  type IncomeEstimateAnswers,
  type IncomeEstimateResultsPayload,
} from "@/lib/income-estimate";
import { buildMockMatches, mergeFunnelAnswers } from "@/lib/match-funnel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const MIN_MS = 2600;

export default function IncomeEstimateLoadingPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Reading your property profile…");

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    async function run() {
      let answers: IncomeEstimateAnswers | null = null;
      try {
        const raw = sessionStorage.getItem(INCOME_ESTIMATE_ANSWERS_KEY);
        if (!raw) {
          router.replace("/income-estimate");
          return;
        }
        const parsed = JSON.parse(raw) as Partial<IncomeEstimateAnswers>;
        answers = mergeIncomeEstimateAnswers(parsed);
      } catch {
        router.replace("/income-estimate");
        return;
      }

      const t1 = window.setTimeout(() => {
        if (!cancelled) setMessage("Blending market benchmarks for your area…");
      }, 850);
      const t2 = window.setTimeout(() => {
        if (!cancelled) setMessage("Applying your availability to a 12-month view…");
      }, 1450);
      const t3 = window.setTimeout(() => {
        if (!cancelled) setMessage("Picking co-hosts who fit this property…");
      }, 2100);

      const funnelMerged = mergeFunnelAnswers(incomeAnswersToMatchFunnel(answers));
      const twelveMonth = estimateTwelveMonthIncome(answers);
      const excluded = readMockExcludedCatalogIds();
      const matches = buildMockMatches(funnelMerged, { excludeCatalogIds: excluded });
      const payload: IncomeEstimateResultsPayload = { matches, twelveMonth };

      const elapsed = Date.now() - started;
      const wait = Math.max(0, MIN_MS - elapsed);
      await new Promise((r) => setTimeout(r, wait));

      if (cancelled) return;
      try {
        sessionStorage.removeItem(MATCH_RESULTS_KEY);
        sessionStorage.setItem(INCOME_ESTIMATE_RESULTS_KEY, JSON.stringify(payload));
        clearMockExcludedCatalogIds();
      } catch {
        /* results page redirects if missing */
      }

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      router.replace("/income-estimate/results");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <Loader2 className="mb-6 h-12 w-12 animate-spin text-[#10B981]" aria-hidden />
      <p className="max-w-sm text-center text-lg font-medium text-foreground">{message}</p>
      <p className="mt-3 max-w-xs text-center text-sm text-muted-foreground">
        Indicative gross bookings only — not tax, fees, or co-host splits.
      </p>
    </div>
  );
}
