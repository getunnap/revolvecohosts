"use client";

import { MOCK_MATCH_EXCLUDED_CATALOG_IDS_KEY } from "@/lib/client-storage";
import { startNewHostIntroCohortId } from "@/lib/host-intro-cohort";

/**
 * Mock-only: re-run find-cohost loading with optional catalog exclusions.
 * Requires match funnel answers still in session; otherwise you’ll be sent back to the funnel start.
 */
export default function HostMockRematchButton({
  excludeCatalogIds,
}: {
  excludeCatalogIds: string[];
}) {
  function run() {
    try {
      sessionStorage.setItem(
        MOCK_MATCH_EXCLUDED_CATALOG_IDS_KEY,
        JSON.stringify(excludeCatalogIds),
      );
      startNewHostIntroCohortId();
    } catch {
      /* empty */
    }
    window.location.href = "/find-cohost/loading";
  }

  return (
    <button
      type="button"
      onClick={run}
      className="rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-2 text-sm font-semibold text-[#047857] transition-colors hover:bg-[#10B981]/20"
    >
      Get three new mock matches
    </button>
  );
}
