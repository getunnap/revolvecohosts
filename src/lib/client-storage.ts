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
