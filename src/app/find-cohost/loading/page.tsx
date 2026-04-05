"use client";

import {
  clearMockExcludedCatalogIds,
  INCOME_ESTIMATE_RESULTS_KEY,
  MATCH_FUNNEL_ANSWERS_KEY,
  MATCH_RESULTS_KEY,
  readMockExcludedCatalogIds,
} from "@/lib/client-storage";
import {
  buildMockMatches,
  estimatePortfolioRevenue,
  mergeFunnelAnswers,
  type MatchFunnelAnswers,
  type MatchResultsPayload,
} from "@/lib/match-funnel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const MIN_MS = 2800;

export default function MatchLoadingPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Reviewing your answers…");

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    async function run() {
      let answers: MatchFunnelAnswers | null = null;
      try {
        const raw = sessionStorage.getItem(MATCH_FUNNEL_ANSWERS_KEY);
        if (!raw) {
          router.replace("/find-cohost");
          return;
        }
        const parsed = JSON.parse(raw) as Partial<MatchFunnelAnswers>;
        answers = mergeFunnelAnswers(parsed);
      } catch {
        router.replace("/find-cohost");
        return;
      }

      const t1 = window.setTimeout(() => {
        if (!cancelled) setMessage("Finding co-hosts in your area…");
      }, 900);
      const t2 = window.setTimeout(() => {
        if (!cancelled) setMessage("Estimating revenue from your property details…");
      }, 1500);
      const t3 = window.setTimeout(() => {
        if (!cancelled) setMessage("Selecting your top three matches…");
      }, 2200);

      const excluded = readMockExcludedCatalogIds();
      const matches = buildMockMatches(answers, { excludeCatalogIds: excluded });
      const revenueEstimate = estimatePortfolioRevenue(answers);
      const payload: MatchResultsPayload = { matches, revenueEstimate };

      const elapsed = Date.now() - started;
      const wait = Math.max(0, MIN_MS - elapsed);
      await new Promise((r) => setTimeout(r, wait));

      if (cancelled) return;
      try {
        sessionStorage.removeItem(INCOME_ESTIMATE_RESULTS_KEY);
        sessionStorage.setItem(MATCH_RESULTS_KEY, JSON.stringify(payload));
        clearMockExcludedCatalogIds();
      } catch {
        // results page will redirect if missing
      }

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      router.replace("/find-cohost/results");
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
        We use your property details for a rough revenue range and to refine co-host fit.
      </p>
    </div>
  );
}
