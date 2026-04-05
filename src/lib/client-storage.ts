/** Session handoff: listing URL + audience before email step */
export const PENDING_AUDIT_KEY = "revolve_pending_audit_v1";

/** After email entered; generating page consumes this to call /api/reports/free */
export const PENDING_GENERATION_KEY = "revolve_pending_generation_v1";

/** Extra listing URLs collected before Stripe (1 primary + N additional = quantity). */
export function additionalListingsKey(reportId: string) {
  return `revolve_additional_listings_${reportId}`;
}

export function guestReportStorageKey(reportId: string) {
  return `revolve_guest_report_${reportId}`;
}

/** Host match funnel: answers before loading / match API */
export const MATCH_FUNNEL_ANSWERS_KEY = "revolve_match_funnel_answers_v1";

/** Populated by loading step for results page */
export const MATCH_RESULTS_KEY = "revolve_match_results_v1";

/** Income estimate funnel answers */
export const INCOME_ESTIMATE_ANSWERS_KEY = "revolve_income_estimate_answers_v1";

/** Income estimate results (matches + 12-month band) */
export const INCOME_ESTIMATE_RESULTS_KEY = "revolve_income_estimate_results_v1";

/** One cohort id per match batch so parallel intro requests group for host messaging */
export const HOST_INTRO_COHORT_KEY = "revolve_host_intro_cohort_v1";

/** Mock-only: catalog ids to skip when generating the next three cards (rematch UX) */
export const MOCK_MATCH_EXCLUDED_CATALOG_IDS_KEY = "revolve_mock_excluded_catalog_ids_v1";

export function readMockExcludedCatalogIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(MOCK_MATCH_EXCLUDED_CATALOG_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export function clearMockExcludedCatalogIds(): void {
  try {
    sessionStorage.removeItem(MOCK_MATCH_EXCLUDED_CATALOG_IDS_KEY);
  } catch {
    /* empty */
  }
}

/**
 * Only one of matchmaking vs income-estimate results should be active at a time (see loading pages).
 * Use this for "back to matches" and similar when the active tool is ambiguous from the URL alone.
 */
export function getActiveMatchResultsPath():
  | "/find-cohost/results"
  | "/income-estimate/results"
  | null {
  if (typeof window === "undefined") return null;
  try {
    if (sessionStorage.getItem(MATCH_RESULTS_KEY)) return "/find-cohost/results";
    if (sessionStorage.getItem(INCOME_ESTIMATE_RESULTS_KEY))
      return "/income-estimate/results";
  } catch {
    /* empty */
  }
  return null;
}
