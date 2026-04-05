export type CohostOperatorStatus = "pending_review" | "approved" | "suspended";

export function isOperatorVerificationProfileComplete(
  areasServed: string | null | undefined,
  listingsManaged: string | null | undefined,
): boolean {
  const a = (areasServed ?? "").trim();
  const l = (listingsManaged ?? "").trim();
  if (!a || !l) return false;
  if (a === "—" || l === "—") return false;
  return a.length >= 3;
}
