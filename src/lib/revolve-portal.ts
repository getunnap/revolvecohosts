/** Stored in auth user_metadata to route marketing header and operator onboarding. */
export const REVOLVE_PORTAL_META_KEY = "revolve_portal" as const;

export type RevolvePortalIntent = "host" | "cohost";

export function readPortalIntentFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): RevolvePortalIntent | null {
  const v = metadata?.[REVOLVE_PORTAL_META_KEY];
  if (v === "cohost" || v === "host") return v;
  return null;
}
